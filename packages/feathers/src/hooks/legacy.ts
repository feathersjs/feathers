import { _ } from '../dependencies';
import { LegacyHookFunction } from '../declarations';

const { each } = _;

export function fromBeforeHook (hook: LegacyHookFunction) {
  return (context: any, next: any) => {
    context.type = 'before';

    return Promise.resolve(hook.call(context.self, context)).then(() => {
      context.type = null;
      return next();
    });
  };
}

export function fromAfterHook (hook: LegacyHookFunction) {
  return (context: any, next: any) => {
    return next().then(() => {
      context.type = 'after';
      return hook.call(context.self, context)
    }).then(() => {
      context.type = null;
    });
  }
}

export function fromErrorHooks (hooks: LegacyHookFunction[]) {
  return (context: any, next: any) => {
    return next().catch((error: any) => {
      let promise: Promise<any> = Promise.resolve();

      context.original = { ...context };
      context.error = error;
      context.type = 'error';

      delete context.result;

      for (const hook of hooks) {
        promise = promise.then(() => hook.call(context.self, context))
      }

      return promise.then(() => {
        context.type = null;

        if (context.result === undefined) {
          throw context.error;
        }
      });
    });
  }
}

export function collectLegacyHooks (target: any, method: string) {
  const {
    before: { [method]: before = [] },
    after: { [method]: after = [] },
    error: { [method]: error = [] }
  } = target.__hooks;
  const beforeHooks = before;
  const afterHooks = [...after].reverse();
  const errorHook = fromErrorHooks(error);

  return [errorHook, ...beforeHooks, ...afterHooks];
}

// Converts different hook registration formats into the
// same internal format
export function convertHookData (obj: any) {
  let hook: any = {};

  if (Array.isArray(obj)) {
    hook = { all: obj };
  } else if (typeof obj !== 'object') {
    hook = { all: [ obj ] };
  } else {
    each(obj, function (value, key) {
      hook[key] = !Array.isArray(value) ? [ value ] : value;
    });
  }

  return hook;
}

// Add `.hooks` functionality to an object
export function enableLegacyHooks (
  obj: any,
  methods: string[] = ['find', 'get', 'create', 'update', 'patch', 'remove'],
  types: string[] = ['before', 'after', 'error']
) {
  const hookData: any = {};

  types.forEach(type => {
    // Initialize properties where hook functions are stored
    hookData[type] = {};
  });

  // Add non-enumerable `__hooks` property to the object
  Object.defineProperty(obj, '__hooks', {
    configurable: true,
    value: hookData,
    writable: true
  });

  return function legacyHooks (this: any, allHooks: any) {
    each(allHooks, (current: any, type) => {
      if (!this.__hooks[type]) {
        throw new Error(`'${type}' is not a valid hook type`);
      }

      const hooks = convertHookData(current);

      each(hooks, (_value, method) => {
        if (method !== 'all' && methods.indexOf(method) === -1) {
          throw new Error(`'${method}' is not a valid hook method`);
        }
      });

      methods.forEach(method => {
        let currentHooks = [...(hooks.all || []), ...(hooks[method] || [])];

        this.__hooks[type][method] = this.__hooks[type][method] || [];

        if (type === 'before') {
          currentHooks = currentHooks.map(fromBeforeHook);
        }

        if (type === 'after') {
          currentHooks = currentHooks.map(fromAfterHook);
        }

        this.__hooks[type][method].push(...currentHooks);
      });
    });

    return this;
  }
}
