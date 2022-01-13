import { MethodNotAllowed } from '@feathersjs/errors/lib';
import { HookContext, NullableId, Params } from '@feathersjs/feathers';
import encodeUrl from 'encodeurl';

export const METHOD_HEADER = 'x-service-method';

export interface ServiceParams {
  id: NullableId,
  data: any,
  params: Params
}

export const statusCodes = {
  created: 201,
  noContent: 204,
  methodNotAllowed: 405,
  success: 200,
  seeOther: 303
};

export const knownMethods: { [key: string]: string } = {
  post: 'create',
  patch: 'patch',
  put: 'update',
  delete: 'remove'
};

export function getServiceMethod (_httpMethod: string, id: unknown, headerOverride?: string) {
  const httpMethod = _httpMethod.toLowerCase();
  
  if (httpMethod === 'post' && headerOverride) {
    return headerOverride;
  }

  const mappedMethod = knownMethods[httpMethod];

  if (mappedMethod) {
    return mappedMethod;
  }

  if (httpMethod === 'get') {
    return id === null ? 'find' : 'get';
  }

  throw new MethodNotAllowed(`Method ${_httpMethod} not allowed`);
}

export const argumentsFor = {
  get: ({ id, params }: ServiceParams) => [ id, params ],
  find: ({ params }: ServiceParams) => [ params ],
  create: ({ data, params }: ServiceParams) => [ data, params ],
  update: ({ id, data, params }: ServiceParams) => [ id, data, params ],
  patch: ({ id, data, params }: ServiceParams) => [ id, data, params ],
  remove: ({ id, params }: ServiceParams) => [ id, params ],
  default: ({ data, params }: ServiceParams) => [ data, params ]
}

export function getResponse (context: HookContext) {
  const http = context.http || {};

  let status = statusCodes.success;
  let headers = http.headers || {};
  let location = headers[ 'Location' ];
  let body = context.result;

  if (context.dispatch !== undefined) {
    body = context.dispatch;
  }

  if (http.location !== undefined) {
    location = encodeUrl(http.location);
    headers = { ...headers, Location: location };
  }

  if (http.status) {
    status = http.status;
  } else if (context.method === 'create') {
    status = statusCodes.created;
  } else if (location !== undefined) {
    status = statusCodes.seeOther;
  } else if (!body) {
    status = statusCodes.noContent;
  }

  return { status, headers, body };
}
