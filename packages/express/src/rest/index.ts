import Debug from 'debug';
import { stripSlashes } from '@feathersjs/commons';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { parseAuthentication } from '../authentication';
import { getHandler } from './getHandler';

const debug = Debug('@feathersjs/express/rest');
const HTTP_METHOD = Symbol('@feathersjs/express/rest/HTTP_METHOD');

export function httpMethod (verb: any, uris?: any) {
  return (method: any) => {
    Object.defineProperty(method, HTTP_METHOD, {
      enumerable: false,
      configurable: true,
      writable: false,
      value: (Array.isArray(uris) ? uris : [uris])
        .reduce(
          (result, uri) => ([...result, { verb, uri }]),
          method[HTTP_METHOD] || []
        )
    });

    return method;
  };
}

export function getDefaultUri (path: string, methods: any, method: any) {
  return methods[method].indexOf('id') === -1
    ? `/${path}/${method}`
    : `/${path}/:__feathersId/${method}`;
}

export function parseRoute (path: any, methods: any, method: any, route: any) {
  return {
    method,
    verb: route.verb,
    uri: route.uri ? `/${path}/${stripSlashes(route.uri)}` : getDefaultUri(path, methods, method)
  };
}

export function getServiceRoutes (service: any, path: any, defaultRoutes: any) {
  const { methods } = service;

  return Object.keys(methods)
    .filter(method => (service[method] && service[method][HTTP_METHOD]))
    .reduce((result, method) => {
      const routes = service[method][HTTP_METHOD];

      if (Array.isArray(routes)) {
        return [
          ...result,
          ...routes.map(route => parseRoute(path, methods, method, route))
        ];
      }

      return [
        ...result,
        parseRoute(path, methods, method, routes)
      ];
    }, defaultRoutes);
}

export function getDefaultRoutes (uri: string) {
  const idUri = `${uri}/:__feathersId`;

  return [
    { method: 'find', verb: 'GET', uri }, // find(params)
    { method: 'get', verb: 'GET', uri: idUri }, // get(id, params)
    { method: 'create', verb: 'POST', uri }, // create(data, params)
    { method: 'patch', verb: 'PATCH', uri: idUri }, // patch(id, data, params)
    { method: 'patch', verb: 'PATCH', uri }, // patch(null, data, params)
    { method: 'update', verb: 'PUT', uri: idUri }, // update(id, data, params)
    { method: 'update', verb: 'PUT', uri }, // update(null, data, params)
    { method: 'remove', verb: 'DELETE', uri: idUri }, // remove(id, data, params)
    { method: 'remove', verb: 'DELETE', uri } // remove(null, data, params)
  ];
}

export function formatter (_req: Request, res: Response, next: NextFunction) {
  if (res.data === undefined) {
    return next();
  }

  res.format({
    'application/json' () {
      res.json(res.data);
    }
  });
}

export function rest (handler: RequestHandler = formatter) {
  return function (this: any) {
    const app = this;

    if (typeof app.route !== 'function') {
      throw new Error('@feathersjs/express/rest needs an Express compatible app. Feathers apps have to wrapped with feathers-express first.');
    }

    if (!app.version || app.version < '3.0.0') {
      throw new Error(`@feathersjs/express/rest requires an instance of a Feathers application version 3.x or later (got ${app.version})`);
    }

    app.rest = {
      find: getHandler('find'),
      get: getHandler('get'),
      create: getHandler('create'),
      update: getHandler('update'),
      patch: getHandler('patch'),
      remove: getHandler('remove')
    };

    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.feathers = Object.assign({
        provider: 'rest',
        headers: req.headers
      }, req.feathers);
      next();
    });

    app.use(parseAuthentication());

    // Register the REST provider
    app.providers.push(function (service: any, path: string, options: any) {
      const baseUri = `/${path}`;
      const { middleware: { before } } = options;
      let { middleware: { after } } = options;

      if (typeof handler === 'function') {
        after = after.concat(handler);
      }

      debug(`Adding REST provider for service \`${path}\` at base route \`${baseUri}\``);

      const routes = getServiceRoutes(service, path, getDefaultRoutes(baseUri));

      for (const { method, verb, uri } of routes) {
        app.route(uri)[verb.toLowerCase()](
          ...before,
          getHandler(method)(service, routes),
          ...after
        );
      }
    });
  };
}

rest.formatter = formatter;
rest.httpMethod = httpMethod;
