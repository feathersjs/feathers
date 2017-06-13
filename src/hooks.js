import { hooks as commons, validateArguments } from 'feathers-commons';

export function hookMixin (service) {
  if (typeof service.hooks === 'function') {
    return;
  }

  const app = this;
  const methods = app.methods;
  const mixin = {};

  commons.enableHooks(service, methods, app.hookTypes);

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
      const hookObject = commons.hookObject(method, 'before', args, hookData);
      const beforeHooks = commons.getHooks(app, this, 'before', method);

      // Process all before hooks
      return commons.processHooks.call(this, beforeHooks, hookObject)
        // Use the hook object to call the original method
        .then(hookObject => {
          // If `hookObject.result` is set, skip the original method
          if (typeof hookObject.result !== 'undefined') {
            return hookObject;
          }

          // Otherwise, call it with arguments created from the hook object
          return _super(...commons.makeArguments(hookObject)).then(result => {
            hookObject.result = result;

            return hookObject;
          });
        })
        // Make a copy of hookObject from `before` hooks and update type
        .then(hookObject => Object.assign({}, hookObject, { type: 'after' }))
        // Run through all `after` hooks
        .then(hookObject => {
          const afterHooks = commons.getHooks(app, this, 'after', method, true);

          return commons.processHooks.call(this, afterHooks, hookObject);
        })
        // Finally, return the result
        .then(hookObject => hookObject.result)
        // Handle errors
        .catch(error => {
          const errorHooks = commons.getHooks(app, this, 'error', method, true);
          const errorHookObject = Object.assign({}, error.hook || hookObject, {
            type: 'error',
            original: error.hook,
            error
          });

          return commons.processHooks
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

    Object.assign(app, {
      hookTypes: [ 'before', 'after', 'error' ]
    });

    commons.enableHooks(app, app.methods, app.hookTypes);

    app.mixins.push(hookMixin);
  };
}
