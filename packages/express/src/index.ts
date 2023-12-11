import express, { Express } from 'express'
import { Application as FeathersApplication, defaultServiceMethods } from '@feathersjs/feathers'
import { routing } from '@feathersjs/transport-commons'
import { createDebug } from '@feathersjs/commons'
import cors from 'cors'
import compression from 'compression'

import { rest, RestOptions, formatter } from './rest'
import { errorHandler, notFound, ErrorHandlerOptions } from './handlers'
import { Application, ExpressOverrides } from './declarations'
import { AuthenticationSettings, authenticate, parseAuthentication } from './authentication'
import {
  default as original,
  static as serveStatic,
  json,
  raw,
  text,
  urlencoded,
  query,
  Router
} from 'express'

export {
  original,
  serveStatic,
  serveStatic as static,
  json,
  raw,
  text,
  urlencoded,
  query,
  rest,
  Router,
  RestOptions,
  formatter,
  errorHandler,
  notFound,
  Application,
  ErrorHandlerOptions,
  ExpressOverrides,
  AuthenticationSettings,
  parseAuthentication,
  authenticate,
  cors,
  compression
}

const debug = createDebug('@feathersjs/express')

export default function feathersExpress<S = any, C = any>(
  feathersApp?: FeathersApplication<S, C>,
  expressApp: Express = express()
): Application<S, C> {
  if (!feathersApp) {
    return expressApp as any
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/express requires a valid Feathers application instance')
  }

  const app = expressApp as any as Application<S, C>
  const { use: expressUse, listen: expressListen } = expressApp as any
  const { use: feathersUse, teardown: feathersTeardown } = feathersApp

  Object.assign(app, {
    use(location: string & keyof S, ...rest: any[]) {
      let service: any
      let options = {}

      const middleware = rest.reduce(
        function (middleware, arg) {
          if (typeof arg === 'function' || Array.isArray(arg)) {
            middleware[service ? 'after' : 'before'].push(arg)
          } else if (!service) {
            service = arg
          } else if (arg.methods || arg.events || arg.express || arg.koa) {
            options = arg
          } else {
            throw new Error('Invalid options passed to app.use')
          }
          return middleware
        },
        {
          before: [],
          after: []
        }
      )

      const hasMethod = (methods: string[]) =>
        methods.some((name) => service && typeof service[name] === 'function')

      // Check for service (any object with at least one service method)
      if (hasMethod(['handle', 'set']) || !hasMethod(defaultServiceMethods)) {
        debug('Passing app.use call to Express app')
        return expressUse.call(this, location, ...rest)
      }

      debug('Registering service with middleware', middleware)
      // Since this is a service, call Feathers `.use`
      feathersUse.call(this, location, service, {
        express: middleware,
        ...options
      })

      return this
    },

    async listen(...args: any[]) {
      const server = expressListen.call(this, ...args)

      this.server = server
      await this.setup(server)
      debug('Feathers application listening')

      return server
    }
  } as Application<S, C>)

  const appDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(app)),
    ...Object.getOwnPropertyDescriptors(app)
  }
  const newDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(feathersApp)),
    ...Object.getOwnPropertyDescriptors(feathersApp)
  }

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.keys(newDescriptors).forEach((prop) => {
    const appProp = appDescriptors[prop]
    const newProp = newDescriptors[prop]

    if (appProp === undefined && newProp !== undefined) {
      Object.defineProperty(expressApp, prop, newProp)
    }
  })

  // Assign teardown and setup which will also make sure that hooks are initialized
  app.setup = feathersApp.setup as any
  app.teardown = async function teardown(server?: any) {
    return feathersTeardown.call(this, server).then(
      () =>
        new Promise((resolve, reject) => {
          if (this.server) {
            this.server.close((e) => (e ? reject(e) : resolve(this)))
          } else {
            resolve(this)
          }
        })
    )
  }

  app.configure(routing() as any)
  app.use((req, _res, next) => {
    req.feathers = { ...req.feathers, provider: 'rest' }
    return next()
  })

  return app
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(feathersExpress, module.exports)
}
