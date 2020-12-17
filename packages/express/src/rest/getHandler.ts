import  Debug from 'debug';
import { Request, Response, NextFunction } from 'express';
import { MethodNotAllowed } from '@feathersjs/errors';
import { _  } from '@feathersjs/commons';
import { HookContext } from '@feathersjs/feathers';

const { omit } = _;
const debug = Debug('@feathersjs/express/rest');

export const statusCodes = {
  created: 201,
  noContent: 204,
  methodNotAllowed: 405
};
export const methodMap = {
  find: 'GET',
  get: 'GET',
  create: 'POST',
  update: 'PUT',
  patch: 'PATCH',
  remove: 'DELETE'
};

export function getAllowedMethods (service: any, routes: any) {
  if (routes) {
    return routes
      .filter(({ method }: any) => typeof service[method] === 'function')
      .map((methodRoute: any) => methodRoute.verb.toUpperCase())
      .filter((value: any, index: number, list: any) => list.indexOf(value) === index);
  }

  return Object.keys(methodMap)
    .filter((method: any) => typeof service[method] === 'function')
    .map((method: any) => (methodMap as any)[method])
    // Filter out duplicates
    .filter((value: any, index: number, list: any) => list.indexOf(value) === index);
}

export function makeArgsGetter (argsOrder: any) {
  return (req: Request, params: any) => argsOrder.map((argName: string) => {
    switch (argName) {
      case 'id':
        return req.params.__feathersId || null;
      case 'data':
        return req.body;
      case 'params':
        return params;
    }
  });
}

// A function that returns the middleware for a given method and service
// `getArgs` is a function that should return additional leading service arguments
export function getHandler (method: string) {
  return (service: any, routes: any) => {
    const getArgs = makeArgsGetter(service.methods[method]);
    const allowedMethods = getAllowedMethods(service, routes);

    return (req: Request, res: Response, next: NextFunction) => {
      const { query } = req;
      const route = omit(req.params, '__feathersId');

      res.setHeader('Allow', allowedMethods.join(','));

      // Check if the method exists on the service at all. Send 405 (Method not allowed) if not
      if (typeof service[method] !== 'function') {
        debug(`Method '${method}' not allowed on '${req.url}'`);
        res.status(statusCodes.methodNotAllowed);

        return next(new MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`));
      }

      // Grab the service parameters. Use req.feathers
      // and set the query to req.query merged with req.params
      const params = Object.assign({
        query, route
      }, req.feathers);

      Object.defineProperty(params, '__returnHook', {
        value: true
      });

      const args = getArgs(req, params);

      debug(`REST handler calling \`${method}\` from \`${req.url}\``);

      service[method](...args, true)
        .then((hook: HookContext) => {
          const data = hook.dispatch !== undefined ? hook.dispatch : hook.result;

          res.data = data;
          res.hook = hook;

          if (hook.statusCode) {
            res.status(hook.statusCode);
          } else if (!data) {
            debug(`No content returned for '${req.url}'`);
            res.status(statusCodes.noContent);
          } else if (method === 'create') {
            res.status(statusCodes.created);
          }

          return next();
        })
        .catch((hook: HookContext) => {
          const { error } = hook;

          debug(`Error in handler: \`${error.message}\``);
          res.hook = hook;

          return next(hook.error);
        });
    };
  };
}
