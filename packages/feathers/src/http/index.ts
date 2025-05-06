import type { Application, Params } from '../index.js'
import type { Middleware } from './middleware.js'
import { BadRequest, MethodNotAllowed, NotFound } from '../errors.js'
import { hooks, middleware } from '../hooks/index.js'
import * as utils from './utils.js'
import { BODY_METHODS, bodyParser, errorHandler, queryParser } from './middleware.js'
import { createContext, getServiceOptions } from '../index.js'

export type HttpParams<Q> = Params<Q> & {
  request?: Request
}

export * from '../client.js'
export * from './middleware.js'

export const serviceToHttpMethod = {
  find: 'GET',
  get: 'GET',
  create: 'POST',
  update: 'PUT',
  patch: 'PATCH',
  remove: 'DELETE'
} as const

export const CORS_HEADERS = [
  'accept',
  'accept-language',
  'content-language',
  'content-type',
  'range',
  'authorization',
  utils.METHOD_HEADER
]

export function createHandler(
  app: Application,
  mw: Middleware[] = [errorHandler(), queryParser(), bodyParser()]
) {
  const handler = async (
    request: Request,
    params: Params = {},
    data: Record<string, unknown> | null = null
  ) => {
    const url = new URL(request.url)
    const lookup = app.lookup(url.pathname)
    const headers = params.headers || Object.fromEntries(request.headers)

    if (lookup === null) {
      throw new NotFound(`Path ${url.pathname} not found`)
    }

    if (BODY_METHODS.includes(request.method) && data === null) {
      throw new BadRequest('Invalid request body')
    }

    // lookup the route for the request
    const { service, params: { __id = null, ...route } = {} } = lookup

    if (request.method === 'OPTIONS') {
      const methods = Object.keys(serviceToHttpMethod).reduce((result, name) => {
        if (typeof (service as any)[name] === 'function') {
          result.add(serviceToHttpMethod[name as keyof typeof serviceToHttpMethod])
        }

        return result
      }, new Set<string>())
      // Handle CORS pre-flight request
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': headers.origin || '*',
          'access-control-allow-methods': [...methods, 'OPTIONS'].join(', '),
          'access-control-allow-headers': CORS_HEADERS.join(', '),
          'access-control-allow-credentials': 'true'
        }
      })
    }

    const id = __id === null ? null : decodeURIComponent(__id)
    // If the request has a method override header, use it instead of the request method.
    const methodOverride = headers[utils.METHOD_HEADER]
    // Get the service method for the request.
    const method = utils.getServiceMethod(request.method, id, methodOverride)
    // Get the methods supported by the service.
    const { methods } = getServiceOptions(service)

    // If the service does not support the requested method, throw an error.
    if (methods && !methods.includes(method)) {
      throw new MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`)
    }

    // Create the arguments for the service method.
    const createArguments =
      utils.argumentsFor[method as keyof typeof utils.argumentsFor] || utils.argumentsFor.default

    // Create the params object
    const serviceParams: HttpParams<any> = {
      provider: 'rest',
      request,
      headers,
      route,
      ...params
    }

    // Create the hook context.
    const hookContext = createContext(service, method)
    // Run the service method.
    const args = createArguments({ id, data, params: serviceParams })
    const context = await (service as any)[method](...args, hookContext)

    if (context.result instanceof Response) {
      return context.result
    }

    // Get the response status, headers, and body.
    const { status, headers: responseHeaders, body } = utils.getResponse(context)

    const response = Response.json(body, {
      status,
      headers: {
        'access-control-allow-origin': request.headers.get('Origin') || '*',
        ...(responseHeaders as Record<string, string>)
      }
    })

    return response
  }

  return hooks(handler, middleware(mw).params('request', 'params', 'data'))
}
