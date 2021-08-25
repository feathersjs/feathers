import { HookContext, NextFunction } from '@feathersjs/feathers';
import { Resolver } from './resolver';
import { Schema } from './schema';

export type FeathersType = 'data'|'result'|'query';

export const resolveQuery = (resolver: Resolver) =>
  async (context: HookContext, next: NextFunction) => {
    const data = context?.params?.query || {};
    const query = await resolver.resolve(data, context);

    context.params = {
      ...context.params,
      query
    }

    return next();
  };

export const resolveData = (resolver: Resolver) =>
  async (context: HookContext, next: NextFunction) => {
    const data = context.data;

    context.data = await resolver.resolve(data, context);

    return next();
  };

export const resolveResult = (resolver: Resolver) =>
  async (context: HookContext, next: NextFunction) => {
    await next();

    const data = context.result;

    context.result = await resolver.resolve(data, context);
  };

export const validateQuery = (schema: Schema<any>) =>
  async (context: HookContext, next: NextFunction) => {
    const data = context?.params?.query || {};
    const query = await schema.validate(data);

    context.params = {
      ...context.params,
      query
    }

    return next();
  };

export const validateData = (schema: Schema<any>) =>
  async (context: HookContext, next: NextFunction) => {
    const data = context.data;

    context.data = await schema.validate(data);

    return next();
  };

export const validateResult = (schema: Schema<any>) =>
  async (context: HookContext, next: NextFunction) => {
    await next();

    const data = context.result;
    context.result = await schema.validate(data);
  };
