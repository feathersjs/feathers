import express, {
  Express, static as _static, json, raw, text, urlencoded, query
} from 'express';
import {
  Application as FeathersApplication, defaultServiceMethods
} from '@feathersjs/feathers';
import { createDebug } from '@feathersjs/commons';

import { Application } from './declarations';
import { errorHandler, notFound } from './handlers';
import { parseAuthentication, authenticate } from './authentication';

export {
  _static as serveStatic, _static as static, json, raw, text,
  urlencoded, query, errorHandler, notFound, express as original,
  authenticate, parseAuthentication
};

export * from './rest';
export * from './declarations';

const debug = createDebug('@feathersjs/express');

export default function feathersExpress<S = any, C = any> (feathersApp?: FeathersApplication<S, C>, expressApp: Express = express()): Application<S, C> {
  if (!feathersApp) {
    return expressApp as any;
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/express requires a valid Feathers application instance');
  }

  const { use, listen } = expressApp as any;
  // A mixin that provides the extended functionality
  const mixin: any = {
    use (location: string, ...rest: any[]) {
      let service: any;
      let options = {};

      const middleware = rest.reduce(function (middleware, arg) {
          if (typeof arg === 'function' || Array.isArray(arg)) {
            middleware[service ? 'after' : 'before'].push(arg);
          } else if (!service) {
            service = arg;
          } else if (arg.methods || arg.events) {
            options = arg;
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
      if (hasMethod(['handle', 'set']) || !hasMethod(defaultServiceMethods)) {
        debug('Passing app.use call to Express app');
        return use.call(this, location, ...rest);
      }

      debug('Registering service with middleware', middleware);
      // Since this is a service, call Feathers `.use`
      (feathersApp as FeathersApplication).use.call(this, location, service, {
        ...options,
        middleware
      });

      return this;
    },

    async listen (...args: any[]) {
      const server = listen.call(this, ...args);

      await this.setup(server);
      debug('Feathers application listening');

      return server;
    }
  };

  const feathersDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(feathersApp)),
    ...Object.getOwnPropertyDescriptors(feathersApp)
  };

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.keys(feathersDescriptors).forEach(prop => {
    const feathersProp = feathersDescriptors[prop];
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
