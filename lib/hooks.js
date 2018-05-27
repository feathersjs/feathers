const { hooks, validateArguments, isPromise, _ } = require('@feathersjs/commons');

const {
  createHookObject,
  getHooks,
  processHooks,
  enableHooks,
  makeArguments
} = hooks;

// A service mixin that adds `service.hooks()` method and functionality
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
      const args = Array.from(arguments);
      // If the last argument is `true` we want to return
      // the actual hook object instead of the result
      const returnHook = args[args.length - 1] === true
        ? args.pop() : false;

      // A reference to the original method
      const _super = service._super.bind(service);
      // Create the hook object that gets passed through
      const hookObject = createHookObject(method, args, {
        type: 'before', // initial hook object type
        service,
        app
      });
      // A hook that validates the arguments and will always be the very first
      const validateHook = context => {
        validateArguments(method, args);

        return context;
      };
      // The `before` hook chain (including the validation hook)
      const beforeHooks = [ validateHook, ...getHooks(app, service, 'before', method) ];

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
        // Make a (shallow) copy of hookObject from `before` hooks and update type
        .then(hookObject => Object.assign({}, hookObject, { type: 'after' }))
        // Run through all `after` hooks
        .then(hookObject => {
          // Combine all app and service `after` and `finally` hooks and process
          const afterHooks = getHooks(app, service, 'after', method, true);
          const finallyHooks = getHooks(app, service, 'finally', method, true);
          const hookChain = afterHooks.concat(finallyHooks);

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
          const errorHooks = getHooks(app, service, 'error', method, true);
          const finallyHooks = getHooks(app, service, 'finally', method, true);
          const hookChain = errorHooks.concat(finallyHooks);

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
