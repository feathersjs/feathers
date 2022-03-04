import express, { Express } from 'express';
import { Application as FeathersApplication, defaultServiceMethods } from '@feathersjs/feathers';
import { routing } from '@feathersjs/transport-commons';
import { createDebug } from '@feathersjs/commons';
import http from 'http';

import { Application } from './declarations';

export { default as original, static, static as serveStatic, json, raw, text, urlencoded, query } from 'express';

export * from './authentication';
export * from './declarations';
export * from './handlers';
export * from './rest';

const debug = createDebug('@feathersjs/express');

export default function feathersExpress<S = any, C = any> (feathersApp?: FeathersApplication<S, C>, expressApp: Express = express()): Application<S, C> {
  if (!feathersApp) {
    return expressApp as any;
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/express requires a valid Feathers application instance');
  }

  const app = expressApp as any as Application<S, C>;
  const { use: expressUse, listen: expressListen } = expressApp as any;
  const feathersUse = feathersApp.use;
  let server:http.Server | undefined;

  Object.assign(app, {
    use (location: string & keyof S, ...rest: any[]) {
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
        return expressUse.call(this, location, ...rest);
      }

      debug('Registering service with middleware', middleware);
      // Since this is a service, call Feathers `.use`
      feathersUse.call(this, location, service, {
        ...options,
        express: middleware
      });

      return this;
    },

    async listen (...args: any[]) {
      server = expressListen.call(this, ...args);

      await this.setup(server);
      debug('Feathers application listening');

      return server;
    },

    async close () {
      if ( server ) {
        server.close();

        await new Promise((resolve) => {
          server.on('close', () => { resolve(true) });
        })
      }

      debug('Feathers application closing');
      await this.teardown();
    }
  } as Application<S, C>);

  const appDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(app)),
    ...Object.getOwnPropertyDescriptors(app)
  };
  const newDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(feathersApp)),
    ...Object.getOwnPropertyDescriptors(feathersApp)
  };

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.keys(newDescriptors).forEach(prop => {
    const appProp = appDescriptors[prop];
    const newProp = newDescriptors[prop];

    if (appProp === undefined && newProp !== undefined) {
      Object.defineProperty(expressApp, prop, newProp);
    }
  });

  app.configure(routing() as any);
  app.use((req, _res, next) => {
    req.feathers = { ...req.feathers, provider: 'rest' };
    return next();
  });

  return app;
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(feathersExpress, module.exports);
}
