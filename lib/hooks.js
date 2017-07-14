const {
  hooks,
  validateArguments,
  isPromise
} = require('feathers-commons');

const {
  createHookObject, getHooks, processHooks, enableHooks, makeArguments
} = hooks;

const hookMixin = exports.hookMixin = function hookMixin (service) {
  if (typeof service.hooks === 'function') {
    return;
  }

  const app = this;
  const methods = app.methods;
  const mixin = {};

  // Add .hooks method and properties to the service
  enableHooks(service, methods, app.hookTypes);

  // Assemble the mixin object that contains all "hooked" service methods
  methods.forEach(method => {
    if (typeof service[method] !== 'function') {
      return;
    }

    mixin[method] = function () {
      const service = this;
      const args = arguments;

      try {
        validateArguments(method, args);
      } catch (e) {
        return Promise.reject(e);
      }

      // A reference to the original method
      const _super = service._super.bind(service);
      // Create the hook object that gets passed through
      const hookObject = createHookObject(method, args, {
        type: 'before', // initial hook object type
        service,
        app
      });
      const beforeHooks = getHooks(app, service, 'before', method);

      // Process all before hooks
      return processHooks.call(service, beforeHooks, hookObject)
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
        // Make a copy of hookObject from `before` hooks and update type
        .then(hookObject =>
          Object.assign({}, hookObject, { type: 'after' })
        )
        // Run through all `after` hooks
        .then(hookObject => {
          const afterHooks = getHooks(app, service, 'after', method, true);
          const finallyHooks = getHooks(app, service, 'finally', method, true);
          const hookChain = afterHooks.concat(finallyHooks);

          return processHooks.call(service, hookChain, hookObject);
        })
        // Finally, return the result (or the hook object if a hidden flag is set)
        .then(hookObject =>
          hookObject.params.__returnHook ? hookObject : hookObject.result
        )
        // Handle errors
        .catch(error => {
          const errorHooks = getHooks(app, service, 'error', method, true);
          const finallyHooks = getHooks(app, service, 'finally', method, true);
          const hookChain = errorHooks.concat(finallyHooks);

          const errorHookObject = Object.assign({}, error.hook || hookObject, {
            type: 'error',
            result: null,
            original: error.hook,
            error
          });

          return processHooks
            .call(service, hookChain, errorHookObject)
            .then(hook => {
              if (errorHookObject.params.__returnHook) {
                return Promise.reject(hook);
              } else if (hook.result) {
                return Promise.resolve(hook.result);
              }

              return Promise.reject(hook.error);
            });
        });
    };
  });

  service.mixin(mixin);
};

module.exports = function () {
  return function () {
    const app = this;

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
