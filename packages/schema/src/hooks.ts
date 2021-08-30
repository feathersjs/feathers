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

export type FeathersType = 'data'|'result'|'query';

export const resolveQuery = <T> (resolver: Resolver<T, HookContext>) =>
  async (context: HookContext, next: NextFunction) => {
    const ctx = getContext(context);
    const data = context?.params?.query || {};
    const query = await resolver.resolve(data, ctx);

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

    if (Array.isArray(data)) {
      context.data = await Promise.all(data.map(current =>
        resolver.resolve(current, ctx)
      ));
    } else {
      context.data = await resolver.resolve(data, ctx);
    }

    return next();
  };

export const resolveResult = <T> (resolver: Resolver<T, HookContext>) =>
  async (context: HookContext, next: NextFunction) => {
    await next();

    const ctx = getContext(context);
    const data = context.method === 'find'
      ? (context.result.data || context.result)
      : context.result;

    if (Array.isArray(data)) {
      context.result = await Promise.all(data.map(current =>
        resolver.resolve(current, ctx)
      ));
    } else {
      context.result = await resolver.resolve(data, ctx);
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
    } catch (error) {
      if (error.ajv) {
        throw new BadRequest(error.message, error.errors);
      }

      throw error;
    }
  };

export const validateData = (schema: Schema<any>) =>
  async (context: HookContext, next: NextFunction) => {
    const data = context.data;

    try {
      context.data = await schema.validate(data);
    } catch (error) {
      if (error.ajv) {
        throw new BadRequest(error.message, error.errors);
      }

      throw error;
    }

    return next();
  };
