import { omit } from 'lodash';
import { HookContext } from '@feathersjs/feathers';

export default (...fields: string[]) => (context: HookContext) => {
  const result = context.dispatch || context.result;
  const o = (current: any) => {
    const data = typeof current.toJSON === 'function'
      ? current.toJSON() : current;
    return omit(data, fields);
  };

  if (!result) {
    return context;
  }

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

  return context;
};
