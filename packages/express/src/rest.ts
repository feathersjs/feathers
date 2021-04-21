import { MethodNotAllowed } from '@feathersjs/errors';
import { BaseHookContext, HookContext } from '@feathersjs/hooks';
import { createDebug } from '@feathersjs/commons';
import { createContext, defaultServiceMethods, getServiceOptions, NullableId, Params } from '@feathersjs/feathers';
import { Request, Response, NextFunction, RequestHandler, Router } from 'express';

import { parseAuthentication } from './authentication';

const debug = createDebug('@feathersjs/express/rest');

export const METHOD_HEADER = 'x-service-method';

export interface ServiceParams {
  id: NullableId,
  data: any,
  params: Params
}

export type ServiceCallback = (req: Request, res: Response, options: ServiceParams) => Promise<HookContext|any>;

export const statusCodes = {
  created: 201,
  noContent: 204,
  methodNotAllowed: 405,
  success: 200
};

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

const getData = (context: HookContext) => {
  if (!(context instanceof BaseHookContext)) {
    return context;
  }

  return context.dispatch !== undefined
    ? context.dispatch
    : context.result;
}

const getStatusCode = (context: HookContext, res: Response) => {
  if (context instanceof BaseHookContext) {
    if (context.statusCode) {
      return context.statusCode;
    }

    if (context.method === 'create') {
      return statusCodes.created;
    }
  }

  if (!res.data) {
    return statusCodes.noContent;
  }

  return statusCodes.success;
}

export const serviceMiddleware = (callback: ServiceCallback) =>
  async (req: Request, res: Response, next: NextFunction) => {
    debug(`Running service middleware for '${req.url}'`);

    try {
      const { query, body: data } = req;
      const { __feathersId: id = null, ...route } = req.params;
      const params = { query, route, ...req.feathers };
      const context = await callback(req, res, { id, data, params });

      res.data = getData(context);
      res.status(getStatusCode(context, res));

      next();
    } catch (error) {
      next(error);
    }
  }

export const serviceMethodHandler = (
  service: any, methodName: string, getArgs: (opts: ServiceParams) => any[], headerOverride?: string
) => serviceMiddleware(async (req, res, options) => {
  const methodOverride = typeof headerOverride === 'string' && (req.headers[headerOverride] as string);
  const method = methodOverride ? methodOverride : methodName
  const { methods } = getServiceOptions(service);

  if (!methods.includes(method) || defaultServiceMethods.includes(methodOverride)) {
    res.status(statusCodes.methodNotAllowed);

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
      const find = serviceMethodHandler(service, 'find', ({ params }) => [ params ]);
      const get = serviceMethodHandler(service, 'get', ({ id, params }) => [ id, params ]);
      const create = serviceMethodHandler(service, 'create', ({ data, params }) => [ data, params ], METHOD_HEADER);
      const update = serviceMethodHandler(service, 'update', ({ id, data, params }) => [ id, data, params ]);
      const patch = serviceMethodHandler(service, 'patch', ({ id, data, params }) => [ id, data, params ]);
      const remove = serviceMethodHandler(service, 'remove', ({ id, params }) => [ id, params ]);

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
