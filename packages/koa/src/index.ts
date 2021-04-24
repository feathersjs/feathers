import Debug from 'debug';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { Application as FeathersApplication, Service } from '@feathersjs/feathers';
import { routing } from '@feathersjs/transport-commons';
import { parseAuthentication } from './authenticate';
import { errorHandler } from './error-handler';

const debug = Debug('@feathersjs/koa');

export type Application<T = any> = Koa & FeathersApplication<T>;

export { rest } from './rest';
export { Koa, bodyParser, errorHandler };

export function koa (feathersApp?: FeathersApplication): Application<any> {
  const koaApp = Object.create(new Koa());

  if (!feathersApp) {
    return koaApp as Application<any>;
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/koa requires a valid Feathers application instance');
  }

  const { listen: koaListen, use: koaUse } = koaApp;

  Object.assign(koaApp, {
    use (location: string|Koa.Middleware, service: Service<any>) {
      if (typeof location === 'string') {
        return feathersApp.use(location, service);
      }

      return koaUse.call(this, location);
    },

    listen (port?: number, ...args: any[]) {
      const server = koaListen.call(this, port, ...args);

      this.setup(server);
      debug('Feathers application listening');

      return server;
    }
  } as Application);

  const feathersDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(feathersApp)),
    ...Object.getOwnPropertyDescriptors(feathersApp)
  };

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.keys(feathersDescriptors).forEach(prop => {
    const feathersProp = feathersDescriptors[prop];
    const koaProp = Object.getOwnPropertyDescriptor(koaApp, prop);
    
    if (koaProp === undefined && feathersProp !== undefined) {
      Object.defineProperty(koaApp, prop, feathersProp);
    }
  });

  const feathersKoa = koaApp as Application;

  feathersKoa.configure(routing());
  feathersKoa.use((ctx, next) => {
    ctx.feathers = { provider: 'rest' };

    return next();
  });
  feathersKoa.use(parseAuthentication());

  return feathersKoa;
}
