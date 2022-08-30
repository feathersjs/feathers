import { feathers } from '@feathersjs/feathers'
import express, { rest, errorHandler } from '@feathersjs/express'
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

export const expressFixture = async (serverPort: number, providerPort: number) => {
  const providerInstance = await provider({ flow: 'oauth2', port: providerPort })
  const app = express<ServiceTypes>(feathers())
  const auth = new AuthenticationService(app)

  auth.register('jwt', new JWTStrategy())
  auth.register('github', new TestOAuthStrategy())

  app.configure(rest())
  app.set('host', '127.0.0.1')
  app.set('port', serverPort)
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

  app.use((req, _res, next) => {
    req.feathers = { fromMiddleware: 'testing' }
    next()
  })
  app.use('authentication', auth)
  app.use('users', memory())

  app.configure(oauth())
  app.use(errorHandler({ logger: false }))

  return app
}
