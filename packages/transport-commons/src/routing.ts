// @ts-ignore
import Router from 'radix-router';
import { stripSlashes } from '@feathersjs/commons';
import { Application } from '@feathersjs/feathers';

export const ROUTER = Symbol('@feathersjs/transport-commons/router');

declare module '@feathersjs/feathers/lib/declarations' {
  interface Application<ServiceTypes> { // eslint-disable-line
    lookup (path: string): { [key: string]: string };
  }
}

export const routing = () => (app: Application) => {
  if (typeof app.lookup === 'function') {
    return;
  }

  const router = new Router();

  Object.assign(app, {
    [ROUTER]: router,
    lookup (path: string): { [key: string]: string } {
      if (!path) {
        return null;
      }

      return this[ROUTER].lookup(stripSlashes('' + path) || '/');
    }
  });

  // Add a mixin that registers a service on the router
  app.mixins.push((service, path) => {
    // @ts-ignore
    app[ROUTER].insert({ path, service });
    // @ts-ignore
    app[ROUTER].insert({
      path: `${path}/:__id`,
      service
    });
  });
};
