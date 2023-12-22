import { feathers } from '@feathersjs/feathers'
import { memory, MemoryService } from '@feathersjs/memory'
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'

import { LocalStrategy, hooks } from '../src/index'
const { hashPassword, protect } = hooks

export type ServiceTypes = {
  authentication: AuthenticationService
  users: MemoryService
}

export function createApplication(
  app = feathers<ServiceTypes>(),
  authOptionOverrides: Record<string, unknown> = {}
) {
  const authentication = new AuthenticationService(app)

  const authConfig = {
    entity: 'user',
    service: 'users',
    secret: 'supersecret',
    authStrategies: ['local', 'jwt'],
    parseStrategies: ['jwt'],
    local: {
      usernameField: 'email',
      passwordField: 'password'
    },
    ...authOptionOverrides
  }
  app.set('authentication', authConfig)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('authentication', authentication)
  app.use(
    'users',
    memory({
      multi: ['create'],
      paginate: {
        default: 10,
        max: 20
      }
    })
  )

  app.service('users').hooks([protect(authConfig.local.passwordField)])
  app.service('users').hooks({
    create: [hashPassword(authConfig.local.passwordField)],
    get: [
      async (context, next) => {
        await next()

        if (context.params.provider) {
          context.result.fromGet = true
        }
      }
    ]
  })

  return app
}
