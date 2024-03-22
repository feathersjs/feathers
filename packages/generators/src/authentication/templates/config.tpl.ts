import crypto from 'crypto'
import { toFile, mergeJSON } from '@featherscloud/pinion'
import { AuthenticationGeneratorContext } from '../index.js'

export const generate = (ctx: AuthenticationGeneratorContext) =>
  Promise.resolve(ctx)
    .then(
      mergeJSON<AuthenticationGeneratorContext>(
        ({ authStrategies }) => {
          const authentication: any = {
            entity: ctx.entity,
            service: ctx.path,
            secret: crypto.randomBytes(24).toString('base64'),
            authStrategies: ['jwt'],
            jwtOptions: {
              header: {
                typ: 'access'
              },
              audience: 'https://yourdomain.com',
              algorithm: 'HS256',
              expiresIn: '1d'
            }
          }

          if (authStrategies.includes('local')) {
            authentication.authStrategies.push('local')
            authentication.local = {
              usernameField: 'email',
              passwordField: 'password'
            }
          }

          const oauthStrategies = authStrategies.filter((name) => name !== 'local')

          if (oauthStrategies.length) {
            authentication.oauth = oauthStrategies.reduce((oauth, name) => {
              oauth[name] = {
                key: '<Client ID>',
                secret: '<Client secret>'
              }

              return oauth
            }, {} as any)
          }

          return { authentication }
        },
        toFile('config', 'default.json')
      )
    )
    .then(
      mergeJSON<AuthenticationGeneratorContext>(
        {
          authentication: {
            secret: 'FEATHERS_SECRET'
          }
        },
        toFile('config', 'custom-environment-variables.json')
      )
    )
