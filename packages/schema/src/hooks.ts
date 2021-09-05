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
  async (context: HookContext, next: NextFunction) => {
    const ctx = getContext(context);
    const data = context?.params?.query || {};
    const query = await resolver.resolve(data, ctx, {
      originalContext: context
    });

    context.params = {
      ...context.params,
      query
    }

    return next();
  };

export const resolveData = <T> (resolver: Resolver<T, HookContext>) =>
  async (context: HookContext, next: NextFunction) => {
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

    return next();
  };

export const resolveResult = <T> (resolver: Resolver<T, HookContext>) =>
  async (context: HookContext, next: NextFunction) => {
    const { $resolve: properties, ...query } = context.params?.query || {};
    const { resolve } = context.params;
    const status = {
      originalContext: context,
      ...resolve,
      properties
    };

    context.params = {
      ...context.params,
      query
    }

    await next();

    const ctx = getContext(context);
    const data = context.method === 'find' && context.result.data
      ? context.result.data
      : context.result;

    if (Array.isArray(data)) {
      context.result = await Promise.all(data.map(current =>
        resolver.resolve(current, ctx, status)
      ));
    } else {
      context.result = await resolver.resolve(data, ctx, status);
    }
  };

export const validateQuery = (schema: Schema<any>) =>
  async (context: HookContext, next: NextFunction) => {
    const data = context?.params?.query || {};

    try {
      const query = await schema.validate(data);

      context.params = {
        ...context.params,
        query
      }

      return next();
    } catch (error: any) {
      throw (error.ajv ? new BadRequest(error.message, error.errors) : error);
    }
  };

export const validateData = (schema: Schema<any>) =>
  async (context: HookContext, next: NextFunction) => {
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

    return next();
  };
