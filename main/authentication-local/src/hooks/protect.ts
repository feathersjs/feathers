import { omit } from 'https://deno.land/x/lodash@4.17.19/lodash.js';
import { HookContext, NextFunction } from '../../../feathers/src/index.ts';

export default (...fields: string[]) => async (context: HookContext, next?: NextFunction) => {
  const o = (current: any) => {
    if (typeof current === 'object' && !Array.isArray(current)) {
      const data = typeof current.toJSON === 'function'
        ? current.toJSON() : current;

      return omit(data, fields);
    }

    return current;
  };

  if (typeof next === 'function') {
    await next();
  }

  const result = context.dispatch || context.result;

  if (result) {
    if (Array.isArray(result)) {
      context.dispatch = result.map(o);
    } else if (result.data && context.method === 'find') {
      context.dispatch = Object.assign({}, result, {
        data: result.data.map(o)
      });
    } else {
      context.dispatch = o(result);
    }

    if (context.params && context.params.provider) {
      context.result = context.dispatch;
    }
  }
};
