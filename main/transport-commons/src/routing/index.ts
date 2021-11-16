import { Application, Service, ServiceOptions } from '../../../feathers/src/index.ts';
import { Router } from './router.ts';

declare module '@feathersjs/feathers/lib/declarations' {
  interface RouteLookup {
    service: Service,
    params: { [key: string]: any }
  }

  interface Application<Services, Settings> {  // eslint-disable-line
    routes: Router<{
      service: Service,
      params?: { [key: string]: any }
    }>;
    lookup (path: string): RouteLookup;
  }
}

export * from './router';

const lookup = function(this: Application, path: string) {
  const result = this.routes.lookup(path);

  if (result === null) {
    return null;
  }

  const { params: colonParams, data: { service, params: dataParams } } = result;

  const params = dataParams ? { ...dataParams, ...colonParams } : colonParams;

  return { service, params };
};

export const routing = () => (app: Application) => {
  if (typeof app.lookup === 'function') {
    return;
  }

  app.routes = new Router();
  app.lookup = lookup;

  // Add a mixin that registers a service on the router
  app.mixins.push((service: Service, path: string, options: ServiceOptions) => {
    const { routeParams: params = {} } = options;

    app.routes.insert(path, { service, params });
    app.routes.insert(`${path}/:__id`, { service, params });
  });
};
