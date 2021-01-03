import express, { Express, static as _static, json, raw, text, urlencoded, query } from 'express';
import Debug from 'debug';
import {
  Application as FeathersApplication, Params as FeathersParams,
  HookContext, ServiceMethods, SetupMethod
} from '@feathersjs/feathers';

import { errorHandler, notFound } from './handlers';
import { rest } from './rest';
import { parseAuthentication, authenticate } from './authentication';

export {
  _static as static, json, raw, text, urlencoded, query,
  errorHandler, notFound, rest, express as original,
  authenticate, parseAuthentication
};

const debug = Debug('@feathersjs/express');

declare module 'express-serve-static-core' {
  interface Request {
      feathers?: Partial<FeathersParams>;
  }

  interface Response {
      data?: any;
      hook?: HookContext;
  }

  type FeathersService = Partial<ServiceMethods<any> & SetupMethod>;

  interface IRouterMatcher<T> {
      // eslint-disable-next-line
      <P extends Params = ParamsDictionary, ResBody = any, ReqBody = any>(
          path: PathParams,
          ...handlers: (RequestHandler<P, ResBody, ReqBody> | FeathersService | Application)[]
      ): T;
  }
}

export type Application<T = any> = Express & FeathersApplication<T>;

export default function feathersExpress<T = any> (feathersApp?: FeathersApplication, expressApp: Express = express()): Application<T> {
  if (!feathersApp) {
    return expressApp as any;
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/express requires a valid Feathers application instance');
  }

  if (!feathersApp.version || feathersApp.version < '3.0.0') {
    throw new Error(`@feathersjs/express requires an instance of a Feathers application version 3.x or later (got ${feathersApp.version || 'unknown'})`);
  }

  const { use, listen } = expressApp as any;
  // An Uberproto mixin that provides the extended functionality
  const mixin: any = {
    use (location: string, ...rest: any[]) {
      let service: any;
      const middleware = Array.from(arguments).slice(1)
        .reduce(function (middleware, arg) {
          if (typeof arg === 'function' || Array.isArray(arg)) {
            middleware[service ? 'after' : 'before'].push(arg);
          } else if (!service) {
            service = arg;
          } else {
            throw new Error('Invalid options passed to app.use');
          }
          return middleware;
        }, {
          before: [],
          after: []
        });

      const hasMethod = (methods: string[]) => methods.some(name =>
        (service && typeof service[name] === 'function')
      );

      // Check for service (any object with at least one service method)
      if (hasMethod(['handle', 'set']) || !hasMethod(this.methods.concat('setup'))) {
        debug('Passing app.use call to Express app');
        return use.call(this, location, ...rest);
      }

      debug('Registering service with middleware', middleware);
      // Since this is a service, call Feathers `.use`
      feathersApp.use.call(this, location, service, { middleware });

      return this;
    },

    listen (...args: any[]) {
      const server = listen.call(this, ...args);

      this.setup(server);
      debug('Feathers application listening');

      return server;
    }
  };

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.getOwnPropertyNames(feathersApp).forEach(prop => {
    const feathersProp = Object.getOwnPropertyDescriptor(feathersApp, prop);
    const expressProp = Object.getOwnPropertyDescriptor(expressApp, prop);

    if (expressProp === undefined && feathersProp !== undefined) {
      Object.defineProperty(expressApp, prop, feathersProp);
    }
  });

  return Object.assign(expressApp, mixin);
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(feathersExpress, module.exports);
}
