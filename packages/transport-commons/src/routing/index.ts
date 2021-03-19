import { Application, Service } from '@feathersjs/feathers';
import { Router } from './router';

declare module '@feathersjs/feathers/lib/declarations' {
  interface RouteLookup {
    service: Service<any>,
    params: { [key: string]: string }
  }

  interface Application<ServiceTypes = {}, AppSettings = {}> { // eslint-disable-line
    routes: Router<any>;
    lookup (path: string): RouteLookup;
  }
}

export * from './router';

export const routing = () => (app: Application) => {
  if (typeof app.lookup === 'function') {
    return;
  }

  const routes = new Router();

  Object.assign(app, {
    routes,
    lookup (this: Application, path: string) {
      const result = this.routes.lookup(path);

      if (result !== null) {
        const { params, data: service } = result;

        return { params, service };
      }

      return result;
    }
  });

  // Add a mixin that registers a service on the router
  app.mixins.push((service: Service<any>, path: string) => {
    app.routes.insert(path, service);
    app.routes.insert(`${path}/:__id`, service);
  });
};
