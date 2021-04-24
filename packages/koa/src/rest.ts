import { FeathersKoaContext } from './utils';
import { Next } from 'koa';

export const methodMap: { [key: string]: any } = {
  POST: 'create',
  PATCH: 'patch',
  PUT: 'update',
  DELETE: 'remove'
};

export const getMethod = (httpMethod: string, id: any): string|null => {
  if (httpMethod === 'GET') {
    return id === null ? 'find' : 'get';
  }

  return methodMap[httpMethod] || null;
};

export const getArguments = (method: string, id: any, data: any, params: any) => {
  const args = [];

  // id
  if (method !== 'create' && method !== 'find') {
    args.push(id);
  }

  // data
  if (method === 'create' || method === 'update' || method === 'patch') {
    args.push(data);
  }

  // params
  args.push(params);

  return args;
};

export const rest = () => async (ctx: FeathersKoaContext, next: Next) => {
  const { app, request } = ctx;
  const { query = {}, path, method: httpMethod } = request;
  const lookup = app.lookup(path);

  if (lookup !== null) {
    const { service, params: lookupParams = {} } = lookup;
    const { __id: id = null, ...route } = lookupParams;
    const method = getMethod(httpMethod, id);
    const args = getArguments(method, id, request.body, {
      ...ctx.feathers,
      query,
      route
    });
    const result = await (service as any)[method](...args);

    ctx.response.status = method === 'create' ? 201 : 200;
    ctx.body = result;
  }

  return next();
};
