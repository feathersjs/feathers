import { MethodNotAllowed } from '../errors.js'
import type { HookContext, NullableId, Params, Query } from '../declarations.js'

export const METHOD_HEADER = 'x-service-method'

export interface ServiceParams {
  id: NullableId
  data: any
  params: Params
}

export const statusCodes = {
  created: 201,
  noContent: 204,
  methodNotAllowed: 405,
  success: 200,
  seeOther: 303
}

export const knownMethods: { [key: string]: string } = {
  post: 'create',
  patch: 'patch',
  put: 'update',
  delete: 'remove'
}

export function getServiceMethod(_httpMethod: string, id: unknown, headerOverride?: string) {
  const httpMethod = _httpMethod.toLowerCase()

  if (httpMethod === 'post' && headerOverride) {
    return headerOverride
  }

  const mappedMethod = knownMethods[httpMethod]

  if (mappedMethod) {
    return mappedMethod
  }

  if (httpMethod === 'get') {
    return id === null ? 'find' : 'get'
  }

  throw new MethodNotAllowed(`Method ${_httpMethod} not allowed`)
}

export const argumentsFor = {
  get: ({ id, params }: ServiceParams) => [id, params],
  find: ({ params }: ServiceParams) => [params],
  create: ({ data, params }: ServiceParams) => [data, params],
  update: ({ id, data, params }: ServiceParams) => [id, data, params],
  patch: ({ id, data, params }: ServiceParams) => [id, data, params],
  remove: ({ id, params }: ServiceParams) => [id, params],
  default: ({ data, params }: ServiceParams) => [data, params]
}

export function getStatusCode(context: HookContext, body: any, location: string | string[]) {
  const { http = {} } = context

  if (http.status) {
    return http.status
  }

  if (location !== undefined) {
    return statusCodes.seeOther
  }

  if (!body) {
    return statusCodes.noContent
  }

  if (context.method === 'create') {
    return statusCodes.created
  }

  return statusCodes.success
}

export function getResponse(context: HookContext) {
  const { http = {} } = context
  const body = context.dispatch !== undefined ? context.dispatch : context.result

  let headers = http.headers || {}
  let location = headers.Location

  if (http.location !== undefined) {
    location = encodeURI(http.location)
    headers = { ...headers, Location: location }
  }

  const status = getStatusCode(context, body, location)

  return { status, headers, body }
}

export type QueryStringify = (query: Query) => string

export function stringifyQuery(query: Query = {}) {
  const searchParams = new URLSearchParams()

  // Add each query parameter to URLSearchParams
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        // Handle array values
        value.forEach((item) => searchParams.append(key, String(item)))
      } else if (typeof value === 'object' && value !== null) {
        // Handle object values by stringifying them
        searchParams.append(key, JSON.stringify(value))
      } else {
        // Handle primitive values
        searchParams.append(key, String(value))
      }
    }
  })

  return searchParams.toString()
}

export type QueryParser = (queryString: string) => Query

export function parseQuery(queryString: string): Query {
  const searchParams = new URLSearchParams(queryString)
  const query: Query = {}

  for (const [key, value] of searchParams.entries()) {
    if (query[key] !== undefined) {
      // Handle multiple values for the same key (arrays)
      if (!Array.isArray(query[key])) {
        query[key] = [query[key]]
      }
      ;(query[key] as any[]).push(value)
    } else {
      query[key] = value
    }
  }

  return query
}
