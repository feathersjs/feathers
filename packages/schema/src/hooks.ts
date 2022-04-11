import { HookContext, NextFunction } from '@feathersjs/feathers';
import { BadRequest } from '../../errors/lib';
import { Resolver } from './resolver';
import { Schema } from './schema';

const getContext = (context: HookContext) => {
  return {
    ...context,
    params: {
      ...context.params,
      query: {}
    }
  }
}

export const resolveQuery = <T> (resolver: Resolver<T, HookContext>) =>
  async (context: HookContext, next?: NextFunction) => {
    const ctx = getContext(context);
    const data = context?.params?.query || {};
    const query = await resolver.resolve(data, ctx, {
      originalContext: context
    });

    context.params = {
      ...context.params,
      query
    }

    if (typeof next === 'function') {
      return next();
    }
  };

export const resolveData = <T> (resolver: Resolver<T, HookContext>) =>
  async (context: HookContext, next?: NextFunction) => {
    const ctx = getContext(context);
    const data = context.data;
    const status = {
      originalContext: context
    };

    if (Array.isArray(data)) {
      context.data = await Promise.all(data.map(current =>
        resolver.resolve(current, ctx, status)
      ));
    } else {
      context.data = await resolver.resolve(data, ctx, status);
    }

    if (typeof next === 'function') {
      return next();
    }
  };

export const resolveResult = <T> (resolver: Resolver<T, HookContext>) =>
  async (context: HookContext, next?: NextFunction) => {
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
      await Promise.all(data.map(async current => resolver.resolve(current, ctx, status))) :
      await resolver.resolve(data, ctx, status);

    if (isPaginated) {
      context.result.data = result;
    } else {
      context.result = result;
    }
  };

export const validateQuery = (schema: Schema<any>) =>
  async (context: HookContext, next?: NextFunction) => {
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

export const validateData = (schema: Schema<any>) =>
  async (context: HookContext, next?: NextFunction) => {
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
