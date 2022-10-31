import compose from 'koa-compose'
import { http } from '@feathersjs/transport-commons'
import { createDebug } from '@feathersjs/commons'
import { getServiceOptions, defaultServiceMethods, createContext } from '@feathersjs/feathers'
import { MethodNotAllowed } from '@feathersjs/errors'

import { Application, Middleware } from './declarations'
import { AuthenticationSettings, parseAuthentication } from './authentication'

const debug = createDebug('@feathersjs/koa/rest')

const serviceMiddleware = (): Middleware => {
  return async (ctx, next) => {
    const { query, headers, path, body: data, method: httpMethod } = ctx.request
    const methodOverride = ctx.request.headers[http.METHOD_HEADER] as string | undefined

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { service, params: { __id: id = null, ...route } = {} } = ctx.lookup!
    const method = http.getServiceMethod(httpMethod, id, methodOverride)
    const { methods } = getServiceOptions(service)

    debug(`Found service for path ${path}, attempting to run '${method}' service method`)

    if (!methods.includes(method) || defaultServiceMethods.includes(methodOverride)) {
      const error = new MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`)
      ctx.response.status = error.code
      throw error
    }

    const createArguments = http.argumentsFor[method as 'get'] || http.argumentsFor.default
    const params = { query, headers, route, ...ctx.feathers }
    const args = createArguments({ id, data, params })
    const contextBase = createContext(service, method, { http: {} })
    ctx.hook = contextBase

    const context = await (service as any)[method](...args, contextBase)
    ctx.hook = context

    const response = http.getResponse(context)
    ctx.status = response.status
    ctx.set(response.headers)
    ctx.body = response.body

    return next()
  }
}

const servicesMiddleware = (): Middleware => {
  return async (ctx, next) => {
    const app = ctx.app
    const lookup = app.lookup(ctx.request.path)

    if (!lookup) {
      return next()
    }

    ctx.lookup = lookup

    const options = getServiceOptions(lookup.service)
    const middleware = options.koa.composed

    return middleware(ctx, next)
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const formatter: Middleware = (_ctx, _next) => {}

export type RestOptions = {
  formatter?: Middleware
  authentication?: AuthenticationSettings
}

export const rest = (options?: RestOptions | Middleware) => {
  options = typeof options === 'function' ? { formatter: options } : options || {}

  const formatterMiddleware = options.formatter || formatter
  const authenticationOptions = options.authentication

  return (app: Application) => {
    app.use(parseAuthentication(authenticationOptions))
    app.use(servicesMiddleware())

    app.mixins.push((_service, _path, options) => {
      const { koa: { before = [], after = [] } = {} } = options

      const middlewares = [].concat(before, serviceMiddleware(), after, formatterMiddleware)
      const middleware = compose(middlewares)

      options.koa ||= {}
      options.koa.composed = middleware
    })
  }
}
