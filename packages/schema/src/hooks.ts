import { HookContext, NextFunction } from '@feathersjs/feathers';
import { BadRequest } from '../../errors/lib';
import { Resolver, ResolverStatus } from './resolver';
import { Schema } from './schema';

const getContext = <H extends HookContext> (context: H) => {
  return {
    ...context,
    params: {
      ...context.params,
      query: {}
    }
  }
}

const runResolvers = async <T, H extends HookContext> (
  resolvers: Resolver<T, H>[],
  data: any,
  ctx: H,
  status?: Partial<ResolverStatus<T, H>>
) => {
  let current: any = data;

  for (const resolver of resolvers) {
    current = await resolver.resolve(current, ctx, status);
  }

  return current as T;
}

export const DISPATCH = Symbol('@feathersjs/schema/dispatch');

export const resolveQuery = <T, H extends HookContext> (...resolvers: Resolver<T, H>[]) =>
  async (context: H, next?: NextFunction) => {
    const ctx = getContext(context);
    const data = context?.params?.query || {};
    const query = await runResolvers(resolvers, data, ctx);

    context.params = {
      ...context.params,
      query
    }

    if (typeof next === 'function') {
      return next();
    }
  };

export const resolveData = <T, H extends HookContext> (...resolvers: Resolver<T, H>[]) =>
  async (context: H, next?: NextFunction) => {
    const ctx = getContext(context);
    const data = context.data;
    const status = {
      originalContext: context
    };

    if (Array.isArray(data)) {
      context.data = await Promise.all(data.map(current =>
        runResolvers(resolvers, current, ctx, status)
      ));
    } else {
      context.data = await runResolvers(resolvers, data, ctx, status);
    }

    if (typeof next === 'function') {
      return next();
    }
  };

export const resolveResult = <T, H extends HookContext> (...resolvers: Resolver<T, H>[]) =>
  async (context: H, next?: NextFunction) => {
    if (typeof next === 'function') {
      const { $resolve: properties, ...query } = context.params?.query || {};
      const resolve = {
        originalContext: context,
        ...context.params.resolve,
        properties
      };

      context.params = {
        ...context.params,
        resolve,
        query
      }

      await next();
    }

    const ctx = getContext(context);
    const status = context.params.resolve;

    const isPaginated = context.method === 'find' && context.result.data;
    const data = isPaginated ? context.result.data : context.result;

    const result = Array.isArray(data) ?
      await Promise.all(data.map(async current => runResolvers(resolvers, current, ctx, status))) :
      await runResolvers(resolvers, data, ctx, status);

    if (isPaginated) {
      context.result.data = result;
    } else {
      context.result = result;
    }
  };

export const resolveDispatch = <T, H extends HookContext> (...resolvers: Resolver<T, H>[]) =>
  async (context: H, next?: NextFunction) => {
    if (typeof next === 'function') {
      await next();
    }

    const ctx = getContext(context);
    const status = context.params.resolve;

    const isPaginated = context.method === 'find' && context.result.data;
    const data = isPaginated ? context.result.data : context.result;
    const resolveDispatch = async (current: any) => {
      const resolved = await runResolvers(resolvers, current, ctx, status)

      return Object.keys(resolved).reduce((res, key) => {
        const value = current[key];
        const hasDispatch = typeof value === 'object' && value !== null && value[DISPATCH] !== undefined;

        res[key] = hasDispatch ? value[DISPATCH] : value;

        return res
      }, {} as any)
    }

    const result = await (Array.isArray(data) ? Promise.all(data.map(resolveDispatch)) : resolveDispatch(data));
    const dispatch = isPaginated ? {
      ...context.result,
      data: result
    } : result;

    context.dispatch = dispatch;
    Object.defineProperty(context.result, DISPATCH, {
      value: dispatch,
      enumerable: false,
      configurable: false
    });
  };

export const validateQuery = <H extends HookContext> (schema: Schema<any>) =>
  async (context: H, next?: NextFunction) => {
    const data = context?.params?.query || {};

    try {
      const query = await schema.validate(data);

      context.params = {
        ...context.params,
        query
      }

      if (typeof next === 'function') {
        return next();
      }
    } catch (error: any) {
      throw (error.ajv ? new BadRequest(error.message, error.errors) : error);
    }
  };

export const validateData = <H extends HookContext> (schema: Schema<any>) =>
  async (context: H, next?: NextFunction) => {
    const data = context.data;

    try {
      if (Array.isArray(data)) {
        context.data = await Promise.all(data.map(current =>
          schema.validate(current)
        ));
      } else {
        context.data = await schema.validate(data);
      }
    } catch (error: any) {
      throw (error.ajv ? new BadRequest(error.message, error.errors) : error);
    }

    if (typeof next === 'function') {
      return next();
    }
  };
