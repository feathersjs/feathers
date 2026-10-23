import { Application, feathers, NextFunction } from '@feathersjs/feathers'
import express, { rest, errorHandler, json, urlencoded } from '@feathersjs/express'
import { koa, rest as koaRest, errorHandler as koaErrorHandler, bodyParser } from '@feathersjs/koa'
import { memory, MemoryService } from '@feathersjs/memory'
import {
  AuthenticationService,
  JWTStrategy,
  AuthenticationRequest,
  AuthenticationParams
} from '@feathersjs/authentication'
import { provider } from './provider'
import { oauth, OAuthStrategy } from '../../src'

export interface ServiceTypes {
  authentication: AuthenticationService
  users: MemoryService
}

export class TestOAuthStrategy extends OAuthStrategy {
  async authenticate(data: AuthenticationRequest, params: AuthenticationParams) {
    const { fromMiddleware } = params
    const authResult = await super.authenticate(data, params)

    if (fromMiddleware) {
      authResult.fromMiddleware = fromMiddleware
    }

    return authResult
  }
}

export const fixtureConfig =
  (port: number, providerInstance: Awaited<ReturnType<typeof provider>>, oauthDefaults?: any) =>
  (app: Application) => {
    app.set('host', '127.0.0.1')
    app.set('port', port)
    app.set('authentication', {
      secret: 'supersecret',
      entity: 'user',
      service: 'users',
      authStrategies: ['jwt'],
      oauth: {
        ...(oauthDefaults ? { defaults: oauthDefaults } : {}),
        github: {
          key: 'some-key',
          secret: 'a secret secret',
          authorize_url: providerInstance.url(`/github/authorize_url`),
          access_url: providerInstance.url(`/github/access_url`),
          profile_url: providerInstance.url(`/github/profile_url`),
          dynamic: true
        },
        gitlab: {
          key: 'some-key',
          secret: 'a secret secret',
          authorize_url: providerInstance.url(`/gitlab/authorize_url`),
          access_url: providerInstance.url(`/gitlab/access_url`),
          profile_url: providerInstance.url(`/gitlab/profile_url`)
        }
      }
    })

    return app
  }

export const expressFixture = async (serverPort: number, providerPort: number, oauthDefaults?: any) => {
  const providerInstance = await provider({ flow: 'oauth2', port: providerPort })
  const app = express<ServiceTypes>(feathers())
  const auth = new AuthenticationService(app)

  auth.register('jwt', new JWTStrategy())
  auth.register('github', new TestOAuthStrategy())
  auth.register('gitlab', new TestOAuthStrategy())

  app.use(json())
  app.use(urlencoded({ extended: true }))
  app.configure(rest())
  app.configure(fixtureConfig(serverPort, providerInstance, oauthDefaults))

  app.use((req, _res, next) => {
    req.feathers = { fromMiddleware: 'testing' }
    next()
  })
  app.use('authentication', auth)
  app.use('users', memory())

  app.configure(oauth())
  app.use(errorHandler({ logger: false }))
  app.hooks({
    teardown: [
      async (_context: any, next: NextFunction) => {
        await providerInstance.close()
        await next()
      }
    ]
  })
  app.hooks({
    error: {
      all: [
        async (context) => {
          console.error(context.error)
        }
      ]
    }
  })

  await app.listen(serverPort)

  return app
}

export const koaFixture = async (serverPort: number, providerPort: number) => {
  const providerInstance = await provider({ flow: 'oauth2', port: providerPort })
  const app = koa<ServiceTypes>(feathers())
  const auth = new AuthenticationService(app)

  auth.register('jwt', new JWTStrategy())
  auth.register('github', new TestOAuthStrategy())
  auth.register('gitlab', new TestOAuthStrategy())

  app.use(koaErrorHandler())
  app.use(bodyParser())
  app.configure(koaRest())
  app.configure(fixtureConfig(serverPort, providerInstance))
  app.use('authentication', auth)
  app.use('users', memory())

  app.configure(oauth())
  app.hooks({
    teardown: [
      async (_context: any, next: NextFunction) => {
        await providerInstance.close()
        await next()
      }
    ]
  })

  await app.listen(serverPort)

  return app
}
