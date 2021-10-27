import { Next } from 'koa';
import { http } from '@feathersjs/transport-commons';
import { createDebug } from '@feathersjs/commons';
import { getServiceOptions, defaultServiceMethods, createContext } from '@feathersjs/feathers';
import { MethodNotAllowed } from '@feathersjs/errors';
import { FeathersKoaContext } from './declarations';

const debug = createDebug('@feathersjs/koa:rest');

export function rest () {
  return async (ctx: FeathersKoaContext, next: Next) => {
    const { app, request } = ctx;
    const { query: koaQuery, headers, path, body: data, method: httpMethod } = request;
    const query = { ...koaQuery };
    const methodOverride = request.headers[http.METHOD_HEADER] ?
      request.headers[http.METHOD_HEADER] as string : null;
    const lookup = app.lookup(path);

    if (lookup !== null) {
      const { service, params: { __id: id = null, ...route } = {} } = lookup;
      const method = http.getServiceMethod(httpMethod, id, methodOverride);
      const { methods } = getServiceOptions(service);
      
      debug(`Found service for path ${path}, attempting to run '${method}' service method`);

      if (!methods.includes(method) || defaultServiceMethods.includes(methodOverride)) {
        ctx.response.status = http.statusCodes.methodNotAllowed;

        throw new MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`);
      }

      const createArguments = (http.argumentsFor as any)[method] || http.argumentsFor.default;
      const params = {
        ...ctx.feathers,
        query,
        headers,
        route
      };
      const args = createArguments({ id, data, params });
      const contextBase = createContext(service, method);
      ctx.hook = contextBase;

      const context = await (service as any)[method](...args, contextBase);
      ctx.hook = context;

      const result = http.getData(context);
      const statusCode = http.getStatusCode(context, result);
      const location = http.getLocation(context, ctx.get('Referrer'));

      ctx.body = result;
      ctx.status = statusCode;
      if (location) ctx.set('Location', location);
    }

    return next();
  };
}
