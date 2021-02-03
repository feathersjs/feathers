// import * as hookCommons from './commons';
// import {
//   hooks as hooksDecorator,
//   HookContext,
//   getMiddleware,
//   withParams,
//   withProps
// } from '@feathersjs/hooks';
// import { assignArguments, validate } from './base';
// import { Application, Service } from '../declarations';

// const baseHooks = [ assignArguments, validate ];
// const {
//   getHooks,
//   enableHooks,
//   ACTIVATE_HOOKS,
//   finallyWrapper,
//   errorWrapper,
//   wrap
// } = hookCommons;

// function getContextUpdaters (app: Application, service: Service<any>, method: string) {
//   const parameters: any = service.methods[method].map(v => (v === 'params' ? ['params', {}] : v));

//   return [
//     withParams(...parameters),
//     withProps({
//       app,
//       service,
//       type: 'before',
//       get path () {
//         if (!service || !app || !app.services) {
//           return null;
//         }

//         return Object.keys(app.services)
//           .find(path => (app.services as any)[path] === service);
//       }
//     })
//   ];
// }

// function getCollector (app: Application, service: Service<any>, method: string) {
//   return (self: any, fn: any, args: any[]) => {
//     const middleware = [
//       ...getMiddleware(self),
//       ...(fn && typeof fn.collect === 'function' ? fn.collect(fn, fn.original, args) : [])
//     ];

//     if (typeof self === 'object') {
//       return middleware;
//     }

//     const hooks = {
//       async: getHooks(app, service, 'async', method),
//       before: getHooks(app, service, 'before', method),
//       after: getHooks(app, service, 'after', method, true),
//       error: getHooks(app, service, 'error', method, true),
//       finally: getHooks(app, service, 'finally', method, true)
//     };

//     return [
//       ...finallyWrapper(hooks.finally),
//       ...errorWrapper(hooks.error),
//       ...baseHooks,
//       ...middleware,
//       ...wrap(hooks)
//     ];
//   };
// }

// function withHooks (app: any, service: any, methods: string[]) {
//   const hookMap = methods.reduce((accu, method) => {
//     if (typeof service[method] !== 'function') {
//       return accu;
//     }

//     accu[method] = {
//       middleware: [],
//       context: getContextUpdaters(app, service, method),
//       collect: getCollector(app, service, method)
//     };

//     return accu;
//   }, {} as any);

//   hooksDecorator(service, hookMap);
// }

// function mixinMethod (this: any) {
//   const service = this;
//   const args = Array.from(arguments);

//   const returnHook = args[args.length - 1] === true || args[args.length - 1] instanceof HookContext
//     ? args.pop() : false;

//   const hookContext = returnHook instanceof HookContext ? returnHook : new HookContext();

//   return this._super.call(service, ...args, hookContext)
//     .then(() => returnHook ? hookContext : hookContext.result)
//     // Handle errors
//     .catch(() => {
//       if (typeof hookContext.error !== 'undefined' && typeof hookContext.result === 'undefined') {
//         return Promise.reject(returnHook ? hookContext : hookContext.error);
//       } else {
//         return returnHook ? hookContext : hookContext.result;
//       }
//     });
// }

// // A service mixin that adds `service.hooks()` method and functionality
// const hookMixin = exports.hookMixin = function hookMixin (service: any) {
//   if (typeof service.hooks === 'function') {
//     return;
//   }

//   service.methods = Object.getOwnPropertyNames(service)
//     .filter(key => typeof service[key] === 'function' && service[key][ACTIVATE_HOOKS])
//     .reduce((result, methodName) => {
//       result[methodName] = service[methodName][ACTIVATE_HOOKS];
//       return result;
//     }, service.methods || {});

//   Object.assign(service.methods, {
//     find: ['params'],
//     get: ['id', 'params'],
//     create: ['data', 'params'],
//     update: ['id', 'data', 'params'],
//     patch: ['id', 'data', 'params'],
//     remove: ['id', 'params']
//   });

//   const app = this;
//   const methodNames = Object.keys(service.methods);

//   withHooks(app, service, methodNames);

//   // Usefull only for the `returnHook` backwards compatibility with `true`
//   const mixin = methodNames.reduce((mixin, method) => {
//     if (typeof service[method] !== 'function') {
//       return mixin;
//     }

//     mixin[method] = mixinMethod;

//     return mixin;
//   }, {} as any);

//   // Add .hooks method and properties to the service
//   enableHooks(service, methodNames, app.hookTypes);

//   service.mixin(mixin);
// };

// export default function () {
//   return function (app: any) {
//     // We store a reference of all supported hook types on the app
//     // in case someone needs it
//     Object.assign(app, {
//       hookTypes: ['async', 'before', 'after', 'error', 'finally']
//     });

//     // Add functionality for hooks to be registered as app.hooks
//     enableHooks(app, app.methods, app.hookTypes);

//     app.mixins.push(hookMixin);
//   };
// };

// export function activateHooks (args: any[]) {
//   return (fn: any) => {
//     Object.defineProperty(fn, ACTIVATE_HOOKS, { value: args });
//     return fn;
//   };
// };
