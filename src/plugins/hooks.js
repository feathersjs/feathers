import {
  hooks as commons, validateArguments, isPromise
} from 'feathers-commons';

const {
  createHookObject, getHooks, processHooks, enableHooks, makeArguments
} = commons;

export function hookMixin (service) {
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
      const _super = this._super.bind(this);
      // Create the hook object that gets passed through
      const hookObject = createHookObject(method, args, {
        type: 'before', // initial hook object type
        service,
        app
      });
      const beforeHooks = getHooks(app, this, 'before', method);

      // Process all before hooks
      return processHooks.call(this, beforeHooks, hookObject)
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
        .then(hookObject => Object.assign({}, hookObject, { type: 'after' }))
        // Run through all `after` hooks
        .then(hookObject => {
          const afterHooks = getHooks(app, this, 'after', method, true);

          return processHooks.call(this, afterHooks, hookObject);
        })
        // Finally, return the result
        .then(hookObject => hookObject.result)
        // Handle errors
        .catch(error => {
          const errorHooks = getHooks(app, this, 'error', method, true);
          const errorHookObject = Object.assign({}, error.hook || hookObject, {
            type: 'error',
            original: error.hook,
            error
          });

          return processHooks
            .call(this, errorHooks, errorHookObject)
            .then(hook => Promise.reject(hook.error));
        });
    };
  });

  service.mixin(mixin);
}

export default function () {
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
}
