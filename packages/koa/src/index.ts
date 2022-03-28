import Koa from 'koa';
import koaQs from 'koa-qs';
import { Application as FeathersApplication } from '@feathersjs/feathers';
import { routing } from '@feathersjs/transport-commons';
import { createDebug } from '@feathersjs/commons';
import http from 'http';

import { Application } from './declarations';

export { default as Koa } from 'koa';
export { default as bodyParser } from 'koa-bodyparser';

export * from './authentication';
export * from './declarations';
export * from './handlers';
export * from './rest';

const debug = createDebug('@feathersjs/koa');

export function koa<S = any, C = any> (feathersApp?: FeathersApplication<S, C>, koaApp: Koa = new Koa()): Application<S, C> {
  if (!feathersApp) {
    return koaApp as any;
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/koa requires a valid Feathers application instance');
  }

  const app = feathersApp as any as Application<S, C>;
  const { listen: koaListen, use: koaUse } = koaApp;
  const feathersUse = feathersApp.use as any;
  let server:http.Server | undefined;

  Object.assign(app, {
    use (location: string|Koa.Middleware, ...args: any[]) {
      if (typeof location === 'string') {
        return feathersUse.call(this, location, ...args);
      }

      return koaUse.call(this, location);
    },

    async listen (port?: number, ...args: any[]) {
      server = koaListen.call(this, port, ...args);

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

      debug('Feathers server closed');

      await this.teardown();
    }
  } as Application);

  const appDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(app)),
    ...Object.getOwnPropertyDescriptors(app)
  };
  const newDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(koaApp)),
    ...Object.getOwnPropertyDescriptors(koaApp)
  };

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.keys(newDescriptors).forEach(prop => {
    const appProp = appDescriptors[prop];
    const newProp = newDescriptors[prop];

    if (appProp === undefined && newProp !== undefined) {
      Object.defineProperty(app, prop, newProp);
    }
  });

  koaQs(app as any);

  app.configure(routing() as any);
  app.use((ctx, next) => {
    ctx.feathers = { ...ctx.feathers, provider: 'rest' };
    return next();
  });

  return app;
}
