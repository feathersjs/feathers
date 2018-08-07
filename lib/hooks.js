const { hooks, validateArguments, isPromise, _ } = require('@feathersjs/commons');

const {
  createHookObject,
  getHooks,
  processHooks,
  enableHooks,
  makeArguments
} = hooks;

const ACTIVATE_HOOKS = typeof Symbol !== 'undefined'
  ? Symbol('__feathersActivateHooks')
  : '__feathersActivateHooks';

function getHookArray (hooks, type) {
  return hooks && hooks[type] && Array.isArray(hooks[type])
    ? hooks[type]
    : hooks && hooks[type]
      ? [hooks[type]]
      : [];
}

const withHooks = function withHooks ({
  app,
  service,
  method
}) {
  return (hooks = {}) => (...args) => {
    const returnHook = args[args.length - 1] === true
      ? args.pop() : false;

    // A reference to the original method
    const _super = service._super ? service._super.bind(service) : service[method].bind(service);
    // Create the hook object that gets passed through
    const hookObject = createHookObject(method, {
      type: 'before', // initial hook object type
      service,
      app
    });

    // A hook that pick arguments for methods defined in `service.methods`
    const pickArgsHook = context => {
      const argsObject = args.reduce(
        (result, value, index) => {
          result[service.methods[method][index]] = value;
          return result;
        },
        { params: {} }
      );

      Object.assign(context, argsObject);

      return context;
    };

    // Process all before hooks
    return processHooks.call(service, [pickArgsHook, ...getHookArray(hooks, 'before')], hookObject)
    // Use the hook object to call the original method
      .then(hookObject => {
        // If `hookObject.result` is set, skip the original method
        if (typeof hookObject.result !== 'undefined') {
          return hookObject;
        }

        // Otherwise, call it with arguments created from the hook object
        const promise = _super(...makeArguments(hookObject));

        if (!isPromise(promise)) {
          throw new Error(`Service method '${hookObject.method}' for '${hookObject.path}' service must return a promise`);
        }

        return promise.then(result => {
          hookObject.result = result;

          return hookObject;
        });
      })
      // Make a (shallow) copy of hookObject from `before` hooks and update type
      .then(hookObject => Object.assign({}, hookObject, { type: 'after' }))
      // Run through all `after` hooks
      .then(hookObject => {
        // Combine all app and service `after` and `finally` hooks and process
        const hookChain = getHookArray(hooks, 'after')
          .concat(getHookArray(hooks, 'finally'));

        return processHooks.call(service, hookChain, hookObject);
      })
      .then(hookObject =>
        // Finally, return the result
        // Or the hook object if the `returnHook` flag is set
        returnHook ? hookObject : hookObject.result
      )
      // Handle errors
      .catch(error => {
        // Combine all app and service `error` and `finally` hooks and process
        const hookChain = getHookArray(hooks, 'error')
          .concat(getHookArray(hooks, 'finally'));

        // A shallow copy of the hook object
        const errorHookObject = _.omit(Object.assign({}, error.hook, hookObject, {
          type: 'error',
          original: error.hook,
          error
        }), 'result');

        return processHooks.call(service, hookChain, errorHookObject)
          .catch(error => {
            errorHookObject.error = error;

            return errorHookObject;
          })
          .then(hook => {
            if (returnHook) {
              // Either resolve or reject with the hook object
              return typeof hook.result !== 'undefined' ? hook : Promise.reject(hook);
            }

            // Otherwise return either the result if set (to swallow errors)
            // Or reject with the hook error
            return typeof hook.result !== 'undefined' ? hook.result : Promise.reject(hook.error);
          });
      });
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
  const mixin = {};

  // Add .hooks method and properties to the service
  enableHooks(service, methodNames, app.hookTypes);

  // Assemble the mixin object that contains all "hooked" service methods
  methodNames.forEach(method => {
    if (typeof service[method] !== 'function') {
      return;
    }

    mixin[method] = function () {
      const service = this;
      const args = Array.from(arguments);
      const returnHook = args[args.length - 1] === true;

      // A hook that validates the arguments and will always be the very first
      const validateHook = context => {
        validateArguments(service.methods, method, returnHook ? args.slice(0, -1) : args);

        return context;
      };

      // Needed
      service._super = service._super.bind(service);

      return withHooks({
        app,
        service,
        method
      })({
        before: [
          validateHook,
          ...getHooks(app, service, 'before', method)
        ],
        after: getHooks(app, service, 'after', method, true),
        error: getHooks(app, service, 'error', method, true),
        finally: getHooks(app, service, 'finally', method, true)
      })(...args);
    };
  });

  service.mixin(mixin);
};

module.exports = function () {
  return function (app) {
    // We store a reference of all supported hook types on the app
    // in case someone needs it
    Object.assign(app, {
      hookTypes: [ 'before', 'after', 'error', 'finally' ]
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
