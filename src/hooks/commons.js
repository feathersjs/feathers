import { each, hooks as utils } from 'feathers-commons';

export function isHookObject (hookObject) {
  return typeof hookObject === 'object' &&
    typeof hookObject.method === 'string' &&
    typeof hookObject.type === 'string';
}

export function processHooks (hooks, initialHookObject) {
  let hookObject = initialHookObject;
  let updateCurrentHook = current => {
    if (current) {
      if (!isHookObject(current)) {
        throw new Error(`${hookObject.type} hook for '${hookObject.method}' method returned invalid hook object`);
      }

      hookObject = current;
    }

    return hookObject;
  };
  let promise = Promise.resolve(hookObject);

  // Go through all hooks and chain them into our promise
  hooks.forEach(fn => {
    const hook = fn.bind(this);

    if (hook.length === 2) { // function(hook, next)
      promise = promise.then(hookObject => {
        return new Promise((resolve, reject) => {
          hook(hookObject, (error, result) =>
            error ? reject(error) : resolve(result));
        });
      });
    } else { // function(hook)
      promise = promise.then(hook);
    }

    // Use the returned hook object or the old one
    promise = promise.then(updateCurrentHook);
  });

  return promise.catch(error => {
    // Add the hook information to any errors
    error.hook = hookObject;
    throw error;
  });
}

export function addHookTypes (target, types = ['before', 'after', 'error']) {
  Object.defineProperty(target, '__hooks', {
    value: {}
  });

  types.forEach(type => {
    // Initialize properties where hook functions are stored
    target.__hooks[type] = {};
  });
}

export function getHooks (app, service, type, method, appLast = false) {
  const appHooks = app.__hooks[type][method] || [];
  const serviceHooks = service.__hooks[type][method] || [];

  if (appLast) {
    return serviceHooks.concat(appHooks);
  }

  return appHooks.concat(serviceHooks);
}

export function baseMixin (methods, ...objs) {
  const mixin = {
    hooks (allHooks) {
      each(allHooks, (obj, type) => {
        if (!this.__hooks[type]) {
          throw new Error(`'${type}' is not a valid hook type`);
        }

        const hooks = utils.convertHookData(obj);

        each(hooks, (value, method) => {
          if (method !== 'all' && methods.indexOf(method) === -1) {
            throw new Error(`'${method}' is not a valid hook method`);
          }
        });

        methods.forEach(method => {
          if (!(hooks[method] || hooks.all)) {
            return;
          }

          const myHooks = this.__hooks[type][method] ||
            (this.__hooks[type][method] = []);

          if (hooks.all) {
            myHooks.push.apply(myHooks, hooks.all);
          }

          if (hooks[method]) {
            myHooks.push.apply(myHooks, hooks[method]);
          }
        });
      });

      return this;
    }
  };

  return Object.assign(mixin, ...objs);
}
