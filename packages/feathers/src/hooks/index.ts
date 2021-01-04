import * as hookCommons from './commons';
import {
  hooks as hooksDecorator,
  HookManager,
  HookContext,
  HookMap,
  Middleware,
  middleware
} from '@feathersjs/hooks';
import { assignArguments, validate } from './base';
import { Application, Service } from '../declarations';
const baseHooks = [ assignArguments, validate ];
const {
  getHooks,
  enableHooks,
  ACTIVATE_HOOKS,
  finallyWrapper,
  errorWrapper,
  wrap
} = hookCommons;

function getMiddlewareOptions (app: Application, service: Service<any>, method: string) {
  const params: string[] = service.methods[method];
  const defaults = params.find(v => v === 'params') ? { params: {} } : null;

  return {
    params,
    defaults,
    props: {
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
    }
  };
}

function getCollector (app: Application, service: Service<any>, method: string) {
  return function collectMiddleware (this: HookManager): Middleware[] {
    const previous = this._parent && this._parent.getMiddleware();
    let result;

    if (previous && this._middleware) {
      result = previous.concat(this._middleware);
    } else {
      result = previous || this._middleware || [];
    }

    const hooks = {
      async: getHooks(app, service, 'async', method),
      before: getHooks(app, service, 'before', method),
      after: getHooks(app, service, 'after', method, true),
      error: getHooks(app, service, 'error', method, true),
      finally: getHooks(app, service, 'finally', method, true)
    };

    return [
      ...finallyWrapper(hooks.finally),
      ...errorWrapper(hooks.error),
      ...baseHooks,
      ...result,
      ...wrap(hooks)
    ];
  };
}

function withHooks (app: Application, service: Service<any>, methods: string[]) {
  const hookMap = methods.reduce((accu, method) => {
    if (typeof service[method] !== 'function') {
      return accu;
    }

    const hookManager = middleware([], getMiddlewareOptions(app, service, method));

    hookManager.getMiddleware = getCollector(app, service, method);

    accu[method] = hookManager;

    return accu;
  }, {} as HookMap);

  hooksDecorator(service, hookMap);
}

const mixinMethod = (_super: any) => {
  const result = function (this: any) {
    const service = this;
    const args = Array.from(arguments);

    const returnHook = args[args.length - 1] === true || args[args.length - 1] instanceof HookContext
      ? args.pop() : false;

    const hookContext = returnHook instanceof HookContext ? returnHook : _super.createContext();

    return _super.call(service, ...args, hookContext)
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

  return Object.assign(result, _super);
}

// A service mixin that adds `service.hooks()` method and functionality
const hookMixin = exports.hookMixin = function hookMixin (service: any) {
  if (typeof service.hooks === 'function') {
    return;
  }

  service.methods = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
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

    mixin[method] = mixinMethod(service[method]);

    return mixin;
  }, {} as any);

  // Add .hooks method and properties to the service
  enableHooks(service, methodNames, app.hookTypes);

  Object.assign(service, mixin);
};

export default function () {
  return function (app: any) {
    // We store a reference of all supported hook types on the app
    // in case someone needs it
    Object.assign(app, {
      hookTypes: ['async', 'before', 'after', 'error', 'finally']
    });

    // Add functionality for hooks to be registered as app.hooks
    enableHooks(app, app.methods, app.hookTypes);

    app.mixins.push(hookMixin);
  };
}

export function activateHooks (args: any[]) {
  return (fn: any) => {
    Object.defineProperty(fn, ACTIVATE_HOOKS, { value: args });
    return fn;
  };
}
