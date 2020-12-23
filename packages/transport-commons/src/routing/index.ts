import { Application, Service } from '@feathersjs/feathers';
import { Router } from './router';

declare module '@feathersjs/feathers/lib/declarations' {
  interface Application<ServiceTypes> { // eslint-disable-line
    routing: Router<any>;
    lookup (path: string): { [key: string]: string };
  }
}

export * from './router';

export const routing = () => (app: Application) => {
  if (typeof app.lookup === 'function') {
    return;
  }

  const routing = new Router();

  Object.assign(app, {
    routing,
    lookup (this: Application, path: string) {
      if (!path || typeof path !== 'string') {
        return null;
      }

      const result = this.routing.lookup(path);

      if (result !== null) {
        return {
          params: result.params,
          service: result.data
        }
      }

      return result;
    }
  });

  // Add a mixin that registers a service on the router
  app.mixins.push((service: Service<any>, path: string) => {
    app.routing.insert(path, service);
    app.routing.insert(`${path}/:__id`, service);
  });
};
