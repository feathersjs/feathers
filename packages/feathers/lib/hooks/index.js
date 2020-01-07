const { hooks: hookCommons, isPromise, _ } = require('@feathersjs/commons');
const { hooks: hooksDecorator } = require('@feathersjs/hooks');
const baseHooks = require('./base');

const {
  createHookObject,
  getHooks,
  processHooks,
  enableHooks,
  ACTIVATE_HOOKS
} = hookCommons;

const makeArguments = (service, method, hookObject) => service.methods[ method ].reduce((result, value) => ([
  ...result,
  hookObject[ value ]
]), []);

function oldHooksProcess (hooks, afterHookObject) {
  return async (ctx, next) => {
    Object.assign(ctx, { type: 'before' });

    await processHooks.call(ctx.service, hooks.before, ctx);

    if (typeof ctx.result !== 'undefined') {
      afterHookObject.result = ctx.result;
    }

    Object.assign(ctx, { type: 'async' });

    // If `ctx.result` is set, skip the original method
    if (typeof ctx.result === 'undefined') {
      await next();
    }

    Object.assign(ctx, { type: 'after' });

    await processHooks.call(ctx.service, hooks.after, afterHookObject);

    Object.assign(ctx, afterHookObject, { type: 'async' });
  };
}

function errorHooksProcess (hooks, beforeHookObject, afterHookObject) {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      beforeHookObject.error = error;
      afterHookObject.error = error;

      // A shallow copy of the hook object
      const actualHookObject = afterHookObject.type ? afterHookObject : beforeHookObject;
      const errorHookObject = _.omit(Object.assign(
        {},
        actualHookObject,
        { type: 'error', original: actualHookObject, error }
      ), 'result');

      try {
        await processHooks.call(ctx.service, hooks.error, errorHookObject);
      } catch (errorInErrorHooks) {
        errorHookObject.error = errorInErrorHooks;
      }

      throw errorHookObject;
    } finally {
      await processHooks.call(ctx.service, hooks.finally, afterHookObject);
    }
  };
}

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

      // A reference to the original method
      const _super = original || service[method].bind(service);

      // Create the hook object that gets passed through
      const beforeHookObject = createHookObject(method, {
        type: 'async', // initial hook object type
        arguments: args,
        service,
        app
      });
      const afterHookObject = {};

      // Process all before hooks
      const fn = async () => {
        // Otherwise, call it with arguments created from the hook object
        const promise = _super(...makeArguments(service, method, beforeHookObject));

        if (!isPromise(promise)) {
          throw new Error(`Service method '${beforeHookObject.method}' for '${beforeHookObject.path}' service must return a promise`);
        }

        const result = await promise;

        // Make a (shallow) copy of hookObject from `before` hooks and update type
        Object.assign(afterHookObject, beforeHookObject, { result, type: 'after' });
      };

      return hooksDecorator(
        fn,
        [errorHooksProcess(hooks, beforeHookObject, afterHookObject)]
          .concat(baseHooks)
          .concat(hooks.async)
          .concat(oldHooksProcess(hooks, afterHookObject)),
        () => beforeHookObject
      ).call(service, ...args)
        .then(() => returnHook ? afterHookObject : afterHookObject.result)
        // Handle errors
        .catch(hook => {
          if (returnHook) {
            // Either resolve or reject with the hook object
            return typeof hook.result !== 'undefined' ? hook : Promise.reject(hook);
          }

          // Otherwise return either the result if set (to swallow errors)
          // Or reject with the hook error
          return typeof hook.result !== 'undefined' ? hook.result : Promise.reject(hook.error);
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
        async: getHooks(app, service, 'async', method),
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
      hookTypes: ['async', 'before', 'after', 'error', 'finally']
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
