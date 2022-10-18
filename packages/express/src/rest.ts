import { Request, Response, RequestHandler, Router } from 'express'
import { MethodNotAllowed } from '@feathersjs/errors'
import { createDebug } from '@feathersjs/commons'
import { http } from '@feathersjs/transport-commons'
import { createContext, defaultServiceMethods, getServiceOptions } from '@feathersjs/feathers'

import { AuthenticationSettings, parseAuthentication } from './authentication'
import { Application } from './declarations'

const debug = createDebug('@feathersjs/express/rest')

const toHandler = (
  func: (req: Request, res: Response, next: () => void) => Promise<void>
): RequestHandler => {
  return (req, res, next) => func(req, res, next).catch((error) => next(error))
}

const serviceMiddleware = (): RequestHandler => {
  return toHandler(async (req, res, next) => {
    const { query, headers, path, body: data, method: httpMethod } = req
    const methodOverride = req.headers[http.METHOD_HEADER] as string | undefined

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { service, params: { __id: id = null, ...route } = {} } = req.lookup!
    const method = http.getServiceMethod(httpMethod, id, methodOverride)
    const { methods } = getServiceOptions(service)

    debug(`Found service for path ${path}, attempting to run '${method}' service method`)

    if (!methods.includes(method) || defaultServiceMethods.includes(methodOverride)) {
      const error = new MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`)
      res.statusCode = error.code
      throw error
    }

    const createArguments = http.argumentsFor[method as 'get'] || http.argumentsFor.default
    const params = { query, headers, route, ...req.feathers }
    const args = createArguments({ id, data, params })
    const contextBase = createContext(service, method, { http: {} })
    res.hook = contextBase

    const context = await (service as any)[method](...args, contextBase)
    res.hook = context

    const response = http.getResponse(context)
    res.statusCode = response.status
    res.set(response.headers)
    res.data = response.body

    return next()
  })
}

const servicesMiddleware = (): RequestHandler => {
  return toHandler(async (req, res, next) => {
    const app = req.app as any as Application
    const lookup = app.lookup(req.path)

    if (!lookup) {
      return next()
    }

    req.lookup = lookup

    const options = getServiceOptions(lookup.service)
    const middleware = options.express.composed

    return middleware(req, res, next)
  })
}

export const formatter: RequestHandler = (_req, res, next) => {
  if (res.data === undefined) {
    return next()
  }

  res.format({
    'application/json'() {
      res.json(res.data)
    }
  })
}

export type RestOptions = {
  formatter?: RequestHandler
  authentication?: AuthenticationSettings
}

export const rest = (options?: RestOptions | RequestHandler) => {
  options = typeof options === 'function' ? { formatter: options } : options || {}

  const formatterMiddleware = options.formatter || formatter
  const authenticationOptions = options.authentication

  return (app: Application) => {
    if (typeof app.route !== 'function') {
      throw new Error('@feathersjs/express/rest needs an Express compatible app.')
    }

    app.use(parseAuthentication(authenticationOptions))
    app.use(servicesMiddleware())

    app.mixins.push((_service, _path, options) => {
      const { express: { before = [], after = [] } = {} } = options

      const middlewares = [].concat(before, serviceMiddleware(), after, formatterMiddleware)
      const middleware = Router().use(middlewares)

      options.express ||= {}
      options.express.composed = middleware
    })
  }
}
