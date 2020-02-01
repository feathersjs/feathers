const { hooks: hookCommons } = require('@feathersjs/commons');
const {
  hooks: hooksDecorator,
  HookContext,
  getMiddleware,
  withParams,
  withProps
} = require('@feathersjs/hooks');
const baseHooks = require('./base');
const { wrap, finallyWrapper, errorWrapper } = require('./wrappers');

const {
  getHooks,
  enableHooks,
  ACTIVATE_HOOKS
} = hookCommons;

function getContextUpdaters (app, service, method) {
  const parameters = service.methods[method].map(v => (v === 'params' ? ['params', {}] : v));

  return [
    withParams(...parameters),
    withProps({
      app,
      service,
      type: 'before',
      get path () {
        if (!service || !app || !app.services) {
          return null;
        }

        return Object.keys(app.services)
          .find(path => app.services[path] === service);
      }
    })
  ];
}

function getCollector (app, service, method) {
  return (self, fn, args) => {
    const hooks = {
      async: getHooks(app, service, 'async', method),
      before: getHooks(app, service, 'before', method),
      after: getHooks(app, service, 'after', method, true),
      error: getHooks(app, service, 'error', method, true),
      finally: getHooks(app, service, 'finally', method, true)
    };

    if (fn && typeof fn.original === 'function') {
      return [
        ...getMiddleware(self),
        ...(fn && typeof fn.collect === 'function' ? fn.collect(fn, fn.original, args) : getMiddleware(fn))
      ];
    }

    return [
      ...finallyWrapper(hooks.finally),
      ...errorWrapper(hooks.error),
      ...baseHooks,
      ...getMiddleware(self),
      ...(fn && typeof fn.collect === 'function' ? fn.collect(fn, fn.original, args) : getMiddleware(fn)),
      ...wrap(hooks)
    ];
  };
}

function withHooks (app, service, methods) {
  const hookMap = methods.reduce((accu, method) => {
    if (typeof service[method] !== 'function') {
      return accu;
    }

    accu[method] = {
      middleware: [],
      context: getContextUpdaters(app, service, method),
      collect: getCollector(app, service, method)
    };

    return accu;
  }, {});

  hooksDecorator(service, hookMap);
}

function mixinMethod () {
  const service = this;
  const args = Array.from(arguments);

  const returnHook = args[args.length - 1] === true || args[args.length - 1] instanceof HookContext
    ? args.pop() : false;

  const hookContext = returnHook instanceof HookContext ? returnHook : new HookContext();

  return this._super.call(service, ...args, hookContext)
    .then(() => returnHook ? hookContext : hookContext.result)
    // Handle errors
    .catch(() => {
      if (typeof hookContext.error !== 'undefined' && typeof hookContext.result === 'undefined') {
        return Promise.reject(returnHook ? hookContext : hookContext.error);
      } else {
        return returnHook ? hookContext : hookContext.result;
      }
    });
}

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

  withHooks(app, service, methodNames);

  // Usefull only for the `returnHook` backwards compatibility with `true`
  const mixin = methodNames.reduce((mixin, method) => {
    if (typeof service[method] !== 'function') {
      return mixin;
    }

    mixin[method] = mixinMethod;

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

module.exports.ACTIVATE_HOOKS = ACTIVATE_HOOKS;

module.exports.activateHooks = function activateHooks (args) {
  return fn => {
    Object.defineProperty(fn, ACTIVATE_HOOKS, { value: args });
    return fn;
  };
};
