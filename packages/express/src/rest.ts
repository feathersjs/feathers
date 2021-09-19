import { MethodNotAllowed } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/hooks';
import { createDebug } from '@feathersjs/commons';
import { http } from '@feathersjs/transport-commons';
import { createContext, defaultServiceMethods, getServiceOptions } from '@feathersjs/feathers';
import { Request, Response, NextFunction, RequestHandler, Router } from 'express';

import { parseAuthentication } from './authentication';

const debug = createDebug('@feathersjs/express/rest');

export type ServiceCallback = (req: Request, res: Response, options: http.ServiceParams) => Promise<HookContext|any>;

export const feathersParams = (req: Request, _res: Response, next: NextFunction) => {
  req.feathers = {
    ...req.feathers,
    provider: 'rest',
    headers: req.headers
  };
  next();
}

export const formatter = (_req: Request, res: Response, next: NextFunction) => {
  if (res.data === undefined) {
    return next();
  }

  res.format({
    'application/json' () {
      res.json(res.data);
    }
  });
}


export const serviceMiddleware = (callback: ServiceCallback) =>
  async (req: Request, res: Response, next: NextFunction) => {
    debug(`Running service middleware for '${req.url}'`);

    try {
      const { query, body: data } = req;
      const { __feathersId: id = null, ...route } = req.params;
      const params = { query, route, ...req.feathers };
      const context = await callback(req, res, { id, data, params });
      const result = http.getData(context);

      res.data = result;
      res.status(http.getStatusCode(context, result));

      next();
    } catch (error: any) {
      next(error);
    }
  }

export const serviceMethodHandler = (
  service: any, methodName: string, getArgs: (opts: http.ServiceParams) => any[], headerOverride?: string
) => serviceMiddleware(async (req, res, options) => {
  const methodOverride = typeof headerOverride === 'string' && (req.headers[headerOverride] as string);
  const method = methodOverride ? methodOverride : methodName
  const { methods } = getServiceOptions(service);

  if (!methods.includes(method) || defaultServiceMethods.includes(methodOverride)) {
    res.status(http.statusCodes.methodNotAllowed);

    throw new MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`);
  }

  const args = getArgs(options);
  const context = createContext(service, method);

  res.hook = context as any;

  return service[method](...args, context);
});

export function rest (handler: RequestHandler = formatter) {
  return function (this: any, app: any) {
    if (typeof app.route !== 'function') {
      throw new Error('@feathersjs/express/rest needs an Express compatible app.');
    }

    app.use(feathersParams);
    app.use(parseAuthentication());

    // Register the REST provider
    app.mixins.push(function (service: any, path: string, options: any) {
      const { middleware: { before = [] } } = options;
      let { middleware: { after = [] } } = options;

      if (typeof handler === 'function') {
        after = after.concat(handler);
      }

      const baseUri = `/${path}`;
      const find = serviceMethodHandler(service, 'find', http.argumentsFor.find);
      const get = serviceMethodHandler(service, 'get', http.argumentsFor.get);
      const create = serviceMethodHandler(service, 'create', http.argumentsFor.create, http.METHOD_HEADER);
      const update = serviceMethodHandler(service, 'update', http.argumentsFor.update);
      const patch = serviceMethodHandler(service, 'patch', http.argumentsFor.patch);
      const remove = serviceMethodHandler(service, 'remove', http.argumentsFor.remove);

      debug(`Adding REST provider for service \`${path}\` at base route \`${baseUri}\``);

      const idRoute = '/:__feathersId';
      const serviceRouter = Router({ mergeParams: true })
        .get('/', find)
        .post('/', create)
        .get(idRoute, get)
        .put('/', update)
        .put(idRoute, update)
        .patch('/', patch)
        .patch(idRoute, patch)
        .delete('/', remove)
        .delete(idRoute, remove);

      app.use(baseUri, ...before, serviceRouter, ...after);
    });
  };
}
