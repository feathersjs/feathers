const { hooks: hookCommons, isPromise, _ } = require('@feathersjs/commons');
const { hooks: hooksDecorator, HookContext } = require('@feathersjs/hooks');
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

function oldHooksProcess (hooks) {
  return async (ctx, next) => {
    Object.assign(ctx, { type: 'before' });
    Object.assign(ctx, await processHooks.call(ctx.service, hooks.before, ctx));

    if (typeof ctx.result !== 'undefined') {
      ctx.result = ctx.result;
    }

    // If `ctx.result` is set, skip the original method
    if (typeof ctx.result === 'undefined') {
      await next();
    }

    Object.assign(ctx, { type: 'after' });
    Object.assign(ctx, await processHooks.call(ctx.service, hooks.after, ctx));
  };
}

function errorHooksProcess (hooks) {
  return async (ctx, next) => {
    let toThrow;

    try {
      await next();
    } catch (error) {
      toThrow = error;

      ctx.original = { ...ctx };

      ctx.error = error;
      ctx.result = undefined;

      try {
        Object.assign(ctx, await processHooks.call(ctx.service, hooks.error, ctx));
        toThrow = ctx.error;
      } catch (errorInErrorHooks) {
        toThrow = errorInErrorHooks;
        ctx.error = errorInErrorHooks;
        ctx.result = undefined;
      }
    } finally {
      try {
        Object.assign(ctx, await processHooks.call(ctx.service, hooks.finally, ctx));
        toThrow = ctx.error;
      } catch (errorInFinallyHooks) {
        toThrow = errorInFinallyHooks;
        ctx.error = errorInFinallyHooks;
        ctx.result = undefined;
      }
    }

    if (toThrow) {
      ctx.type = 'error';
      ctx.error = toThrow;
      throw toThrow;
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

      const hookContext = new HookContext(createHookObject(method, {
        type: 'before', // initial hook object type
        arguments: args,
        service,
        app
      }));

      // Process all before hooks
      const fn = async () => {
        // Otherwise, call it with arguments created from the hook object
        const promise = _super(...makeArguments(service, method, hookContext));

        if (!isPromise(promise)) {
          throw new Error(`Service method '${hookContext.method}' for '${hookContext.path}' service must return a promise`);
        }

        hookContext.type = 'after';

        return promise;
      };

      return hooksDecorator(
        fn,
        [errorHooksProcess(hooks)]
          .concat(baseHooks)
          .concat(hooks.async)
          .concat(oldHooksProcess(hooks))
      ).call(service, ...args, hookContext)
        .then(() => returnHook ? hookContext : hookContext.result)
        // Handle errors
        .catch(() => {
          if (typeof hookContext.error !== 'undefined' && typeof hookContext.result === 'undefined') {
            return Promise.reject(returnHook ? hookContext : hookContext.error);
          } else {
            return returnHook ? hookContext : hookContext.result;
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
