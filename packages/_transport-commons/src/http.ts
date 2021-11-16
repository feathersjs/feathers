import { MethodNotAllowed } from '@feathersjs/errors/lib';
import { HookContext, NullableId, Params } from '@feathersjs/feathers';

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
  success: 200
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

export function getData (context: HookContext) {
  return context.dispatch !== undefined
    ? context.dispatch
    : context.result;
}

export function getStatusCode (context: HookContext, data?: any) {
  if (context.statusCode) {
    return context.statusCode;
  }

  if (context.method === 'create') {
    return statusCodes.created;
  }

  if (!data) {
    return statusCodes.noContent;
  }

  return statusCodes.success;
}
