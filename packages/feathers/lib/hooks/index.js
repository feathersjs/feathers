const { hooks, isPromise } = require('@feathersjs/commons');
const baseHooks = require('./base');

const {
  createHookObject,
  getHooks,
  processHooks,
  enableHooks,
  ACTIVATE_HOOKS
} = hooks;

const withHooks = function withHooks ({
  app,
  service,
  method,
  original
}) {
  return (_hooks = {}) => {
    const hooks = app.hookTypes.reduce((result, type) => {
      const value = _hooks[type] || [];

      result[type] = Array.isArray(value) ? value : [ value ];

      return result;
    }, {});

    return function (...args) {
      const returnHook = args[args.length - 1] === true
        ? args.pop() : false;

      // Create the hook object that gets passed through
      const hookObject = createHookObject(method, {
        type: 'before', // initial hook object type
        arguments: args,
        service,
        app
      });

      return Promise.resolve(hookObject)

        // Run `before` hooks
        .then(hookObject => {
          return processHooks.call(service, baseHooks.concat(hooks.before), hookObject);
        })

        // Run the original method
        .then(hookObject => {
          // If `hookObject.result` is set, skip the original method
          if (typeof hookObject.result !== 'undefined') {
            return hookObject;
          }

          // Otherwise, call it with arguments created from the hook object
          const promise = new Promise(resolve => {
            const func = original || service[method];
            const args = service.methods[method].map((value) => hookObject[value]);
            const result = func.apply(service, args);

            if (!isPromise(result)) {
              throw new Error(`Service method '${hookObject.method}' for '${hookObject.path}' service must return a promise`);
            }

            resolve(result);
          });

          return promise
            .then(result => {
              hookObject.result = result;
              return hookObject;
            })
            .catch(error => {
              error.hook = hookObject;
              throw error;
            });
        })

        // Run `after` hooks
        .then(hookObject => {
          const afterHookObject = Object.assign({}, hookObject, {
            type: 'after'
          });

          return processHooks.call(service, hooks.after, afterHookObject);
        })

        // Run `errors` hooks
        .catch(error => {
          const errorHookObject = Object.assign({}, error.hook, {
            type: 'error',
            original: error.hook,
            error,
            result: undefined
          });

          return processHooks.call(service, hooks.error, errorHookObject)
            .catch(error => {
              const errorHookObject = Object.assign({}, error.hook, {
                error,
                result: undefined
              });

              return errorHookObject;
            });
        })

        // Run `finally` hooks
        .then(hookObject => {
          return processHooks.call(service, hooks.finally, hookObject)
            .catch(error => {
              const errorHookObject = Object.assign({}, error.hook, {
                error,
                result: undefined
              });

              return errorHookObject;
            });
        })

        // Resolve with a result or reject with an error
        .then(hookObject => {
          if (typeof hookObject.error !== 'undefined' && typeof hookObject.result === 'undefined') {
            return Promise.reject(returnHook ? hookObject : hookObject.error);
          } else {
            return returnHook ? hookObject : hookObject.result;
          }
        });
    };
  };
};

// A service mixin that adds `service.hooks()` method and functionality
const hookMixin = exports.hookMixin = function hookMixin (service) {
  if (typeof service.hooks === 'function') {
    return;
  }

  service.methods = Object.getOwnPropertyNames(service)
    .filter(key => typeof service[key] === 'function' && service[key][ACTIVATE_HOOKS])
    .reduce((result, methodName) => {
      result[methodName] = service[methodName][ACTIVATE_HOOKS];
      return result;
    }, service.methods || {});

  Object.assign(service.methods, {
    find: ['params'],
    get: ['id', 'params'],
    create: ['data', 'params'],
    update: ['id', 'data', 'params'],
    patch: ['id', 'data', 'params'],
    remove: ['id', 'params']
  });

  const app = this;
  const methodNames = Object.keys(service.methods);
  // Assemble the mixin object that contains all "hooked" service methods
  const mixin = methodNames.reduce((mixin, method) => {
    if (typeof service[method] !== 'function') {
      return mixin;
    }

    mixin[method] = function () {
      const service = this;
      const args = Array.from(arguments);
      const original = service._super.bind(service);

      return withHooks({
        app,
        service,
        method,
        original
      })({
        before: getHooks(app, service, 'before', method),
        after: getHooks(app, service, 'after', method, true),
        error: getHooks(app, service, 'error', method, true),
        finally: getHooks(app, service, 'finally', method, true)
      })(...args);
    };

    return mixin;
  }, {});

  // Add .hooks method and properties to the service
  enableHooks(service, methodNames, app.hookTypes);

  service.mixin(mixin);
};

module.exports = function () {
  return function (app) {
    // We store a reference of all supported hook types on the app
    // in case someone needs it
    Object.assign(app, {
      hookTypes: ['before', 'after', 'error', 'finally']
    });

    // Add functionality for hooks to be registered as app.hooks
    enableHooks(app, app.methods, app.hookTypes);

    app.mixins.push(hookMixin);
  };
};

module.exports.withHooks = withHooks;

module.exports.ACTIVATE_HOOKS = ACTIVATE_HOOKS;

module.exports.activateHooks = function activateHooks (args) {
  return fn => {
    Object.defineProperty(fn, ACTIVATE_HOOKS, { value: args });
    return fn;
  };
};
