import Proto from 'uberproto';
import { hooks as utils } from 'feathers-commons';
import { addHookTypes, processHooks, baseMixin, getHooks } from './commons';

function isPromise (result) {
  return typeof result !== 'undefined' &&
    typeof result.then === 'function';
}

function hookMixin (service) {
  if (typeof service.hooks === 'function') {
    return;
  }

  const app = this;
  const methods = app.methods;
  const old = {
    before: service.before,
    after: service.after
  };
  const mixin = baseMixin(methods, {
    before (before) {
      return this.hooks({ before });
    },

    after (after) {
      return this.hooks({ after });
    }
  });

  addHookTypes(service);

  methods.forEach(method => {
    if (typeof service[method] !== 'function') {
      return;
    }

    mixin[method] = function () {
      const service = this;
      // A reference to the original method
      const _super = this._super.bind(this);
      // Additional data to add to the hook object
      const hookData = {
        app,
        service,
        get path () {
          return Object.keys(app.services)
            .find(path => app.services[path] === service);
        }
      };
      // Create the hook object that gets passed through
      const hookObject = utils.hookObject(method, 'before', arguments, hookData);
      // Get all hooks
      const hooks = {
        // For before hooks the app hooks will run first
        before: getHooks(app, this, 'before', method),
        // For after and error hooks the app hooks will run last
        after: getHooks(app, this, 'after', method, true),
        error: getHooks(app, this, 'error', method, true)
      };

      // Process all before hooks
      return processHooks.call(this, hooks.before, hookObject)
        // Use the hook object to call the original method
        .then(hookObject => {
          if (typeof hookObject.result !== 'undefined') {
            return Promise.resolve(hookObject);
          }

          return new Promise((resolve, reject) => {
            const args = utils.makeArguments(hookObject);
            // The method may not be normalized yet so we have to handle both
            // ways, either by callback or by Promise
            const callback = function (error, result) {
              if (error) {
                reject(error);
              } else {
                hookObject.result = result;
                resolve(hookObject);
              }
            };

            // We replace the callback with resolving the promise
            args.splice(args.length - 1, 1, callback);

            const result = _super(...args);

            if (isPromise(result)) {
              result.then(data => callback(null, data), callback);
            }
          });
        })
        // Make a copy of hookObject from `before` hooks and update type
        .then(hookObject => Object.assign({}, hookObject, { type: 'after' }))
        // Run through all `after` hooks
        .then(processHooks.bind(this, hooks.after))
        // Finally, return the result
        .then(hookObject => hookObject.result)
        // Handle errors
        .catch(error => {
          const errorHook = Object.assign({}, error.hook || hookObject, {
            type: 'error',
            original: error.hook,
            error
          });

          return processHooks
            .call(this, hooks.error, errorHook)
            .then(hook => Promise.reject(hook.error));
        });
    };
  });

  service.mixin(mixin);

  // Before hooks that were registered in the service
  if (old.before) {
    service.before(old.before);
  }

  // After hooks that were registered in the service
  if (old.after) {
    service.after(old.after);
  }
}

function configure () {
  return function () {
    const app = this;

    addHookTypes(app);

    Proto.mixin(baseMixin(app.methods), app);

    this.mixins.unshift(hookMixin);
  };
}

export default configure;
