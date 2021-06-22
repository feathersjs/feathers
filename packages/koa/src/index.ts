import Debug from 'debug';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import koaQs from 'koa-qs';
import { Application as FeathersApplication } from '@feathersjs/feathers';
import { routing } from '@feathersjs/transport-commons';

import { Application } from './declarations';
import { errorHandler } from './error-handler';

const debug = Debug('@feathersjs/koa');

export * from './declarations';
export * from './authenticate';
export { rest } from './rest';
export { Koa, bodyParser, errorHandler };

export function koa (_app?: FeathersApplication): Application<any> {
  const koaApp = new Koa();

  if (!_app) {
    return koaApp as unknown as Application<any>;
  }

  if (typeof _app.setup !== 'function') {
    throw new Error('@feathersjs/koa requires a valid Feathers application instance');
  }

  const app = _app as Application;
  const { listen: koaListen, use: koaUse } = koaApp;
  const oldUse = app.use;

  Object.assign(app, {
    use (location: string|Koa.Middleware, ...args: any[]) {
      if (typeof location === 'string') {
        return (oldUse as any).call(this, location, ...args);
      }

      return koaUse.call(this, location);
    },

    async listen (port?: number, ...args: any[]) {
      const server = koaListen.call(this, port, ...args);

      await this.setup(server);
      debug('Feathers application listening');

      return server;
    }
  } as Application);

  const feathersDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(app)),
    ...Object.getOwnPropertyDescriptors(app)
  };
  const koaDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(koaApp)),
    ...Object.getOwnPropertyDescriptors(koaApp)
  };

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.keys(koaDescriptors).forEach(prop => {
    const feathersProp = feathersDescriptors[prop];
    const koaProp = koaDescriptors[prop];

    if (koaProp !== undefined && feathersProp === undefined) {
      Object.defineProperty(app, prop, koaProp);
    }
  });

  koaQs(app as any);
  app.configure(routing());
  app.use((ctx, next) => {
    ctx.feathers = { provider: 'rest' };

    return next();
  });

  return app;
}
