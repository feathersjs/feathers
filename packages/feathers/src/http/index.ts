import type { Application, HookContext, Params } from '../index.js'
import type { Middleware } from './middleware.js'
import { BadRequest, MethodNotAllowed, NotFound } from '../errors.js'
import { hooks, middleware } from '../hooks/index.js'
import * as utils from './utils.js'
import { BODY_METHODS, bodyParser, errorHandler, queryParser } from './middleware.js'
import { createContext, getServiceOptions } from '../index.js'

export type HttpParams<Q> = Params<Q> & {
  request?: Request
}

export * from './middleware.js'
export * from './sse.service.js'
export * from './utils.js'

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

function handleResponse(request: Request, context: HookContext) {
  const { status, headers: responseHeaders, body } = utils.getResponse(context)
  const init = {
    status,
    headers: {
      'access-control-allow-origin': request.headers.get('Origin') || '*',
      ...(responseHeaders as Record<string, string>)
    }
  }

  if (!body) {
    return new Response(null, init)
  }

  return Response.json(body, init)
}

function handleAsyncIterable(request: Request, context: HookContext) {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  const abortSignal = request.signal

  abortSignal.addEventListener('abort', () => {
    writer.close()
  })

  const handleStream = async () => {
    try {
      for await (const item of context.result) {
        try {
          await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(item)}\n\n`))
        } catch (error) {
          // Handle invalid state errors gracefully
          if ((error as { code?: string }).code === 'ERR_INVALID_STATE') {
            break
          }
          throw error
        }
      }
    } finally {
      try {
        await writer.close()
      } catch (_error) {}
    }
  }

  handleStream()

  return new Response(readable, {
    headers: {
      'access-control-allow-origin': request.headers.get('Origin') || '*',
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive'
    }
  })
}

export function createHandler(
  app: Application,
  mw: Middleware[] = [errorHandler(), queryParser(), bodyParser()]
) {
  const handler = async (request: Request, ...rest: unknown[]) => {
    const [params = {}, data] = rest as [Params, Record<string, unknown> | null]
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

    // Check if this is a custom method path with specific HTTP method
    const routeMethod = lookup.method
    const routeHttpMethod = lookup.httpMethod

    // Determine the service method to call
    let method: string
    if (routeMethod) {
      // Custom path route - verify HTTP method matches
      if (routeHttpMethod && request.method.toUpperCase() !== routeHttpMethod) {
        throw new MethodNotAllowed(`Method ${request.method} not allowed for this endpoint.`)
      }
      method = routeMethod
    } else {
      // Standard route - use HTTP verb mapping or header override
      method = utils.getServiceMethod(request.method, id, methodOverride)
    }

    // Get the methods supported by the service.
    const { methods, methodOptions } = getServiceOptions(service)

    // If the service does not support the requested method, throw an error.
    if (methods && !methods.includes(method)) {
      throw new MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`)
    }

    // Check if the method is internal only (external: false)
    const methodConfig = methodOptions?.[method]
    if (methodConfig?.external === false) {
      throw new MethodNotAllowed(`Method \`${method}\` is not available externally.`)
    }

    // Create the params object
    const serviceParams: HttpParams<any> = {
      provider: 'rest',
      request,
      headers,
      route,
      ...params
    }

    // Build arguments based on method config or defaults
    let args: any[]
    if (methodConfig?.args) {
      // Use custom args from method config
      args = utils.buildMethodArguments(methodConfig.args, { id, data, params: serviceParams })
    } else {
      // Fall back to standard argument builders
      const createArguments =
        utils.argumentsFor[method as keyof typeof utils.argumentsFor] || utils.argumentsFor.default
      args = createArguments({ id, data, params: serviceParams })
    }

    // Create the hook context.
    const hookContext = createContext(service, method)
    const context = await (service as any)[method](...args, hookContext)

    if (context.result instanceof Response) {
      return context.result
    } else if (context.result?.[Symbol.asyncIterator]) {
      return handleAsyncIterable(request, context)
    } else {
      return handleResponse(request, context)
    }
  }

  return hooks(handler, middleware(mw).params('request', 'params', 'data'))
}
