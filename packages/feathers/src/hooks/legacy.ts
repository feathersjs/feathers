import { _ } from '@feathersjs/commons';

const { each } = _;

export function toBeforeHook (hook: any) {
  return (context: any, next: any) => {
    context.type = 'before';

    return Promise.resolve(hook.call(context.self, context))
      .then(() => {
        delete context.type;
        return next();
      });
  };
}

export function toAfterHook (hook: any) {
  return (context: any, next: any) => {
    return next()
      .then(() => {
        context.type = 'after';
        return hook.call(context.self, context)
      }).then(() => {
        delete context.type;
      });
  }
}

export function collectLegacyHooks (_app: any, service: any, method: string) {
  const {
    before: { [method]: serviceBefore = [] },
    after: { [method]: serviceAfter = [] }
  } = service.__hooks;
  const beforeHooks = serviceBefore.length ? serviceBefore : [];
  const afterHooks = serviceAfter.length ? [...serviceAfter].reverse() : [];

  return beforeHooks.concat(afterHooks);
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
  if (typeof obj.hooks === 'function') {
    return obj;
  }

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
          currentHooks = currentHooks.map(toBeforeHook);
        }

        if (type === 'after') {
          currentHooks = currentHooks.map(toAfterHook);
        }

        this.__hooks[type][method].push(...currentHooks);
      });
    });

    return this;
  }
}