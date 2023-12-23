import { Application, feathers, NextFunction } from '@feathersjs/feathers'
import express, { rest, errorHandler } from '@feathersjs/express'
import { memory, MemoryService } from '@feathersjs/memory'
import {
  AuthenticationService,
  JWTStrategy,
  AuthenticationRequest,
  AuthenticationParams
} from '@feathersjs/authentication'
import { provider } from './provider'
import { oauth, OAuthStrategy } from '../../src/index'

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
  (port: number, providerInstance: Awaited<ReturnType<typeof provider>>) => (app: Application) => {
    app.set('host', '127.0.0.1')
    app.set('port', port)
    app.set('authentication', {
      secret: 'supersecret',
      entity: 'user',
      service: 'users',
      authStrategies: ['jwt'],
      oauth: {
        github: {
          key: 'some-key',
          secret: 'a secret secret',
          authorize_url: providerInstance.url(`/github/authorize_url`),
          access_url: providerInstance.url(`/github/access_url`),
          dynamic: true
        }
      }
    })

    return app
  }

export const expressFixture = async (serverPort: number, providerPort: number) => {
  const providerInstance = await provider({ flow: 'oauth2', port: providerPort })
  const app = express<ServiceTypes>(feathers())
  const auth = new AuthenticationService(app)

  auth.register('jwt', new JWTStrategy())
  auth.register('github', new TestOAuthStrategy())

  app.configure(rest())
  app.configure(fixtureConfig(serverPort, providerInstance))

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
