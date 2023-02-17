import chalk from 'chalk'
import { generator, runGenerators, prompt, install } from '@feathershq/pinion'
import { addVersions, checkPreconditions, FeathersBaseContext, initializeBaseContext } from '../commons'
import { generate as serviceGenerator, ServiceGeneratorContext } from '../service/index'

export interface AuthenticationGeneratorContext extends ServiceGeneratorContext {
  service: string
  entity: string
  authStrategies: string[]
  dependencies: string[]
}

export type AuthenticationGeneratorArguments = FeathersBaseContext &
  Partial<Pick<AuthenticationGeneratorContext, 'service' | 'authStrategies' | 'path' | 'schema' | 'type'>>

export const generate = (ctx: AuthenticationGeneratorArguments) =>
  generator(ctx)
    .then(initializeBaseContext())
    .then(checkPreconditions())
    .then(
      prompt<AuthenticationGeneratorArguments, AuthenticationGeneratorContext>(
        (ctx: AuthenticationGeneratorArguments) => [
          {
            type: 'checkbox',
            name: 'authStrategies',
            when: !ctx.authStrategies,
            message: 'Which authentication methods do you want to use?',
            suffix: chalk.grey(' Other methods and providers can be added at any time.'),
            choices: [
              {
                name: 'Email + Password',
                value: 'local',
                checked: true
              },
              {
                name: 'Google',
                value: 'google'
              },
              {
                name: 'Facebook',
                value: 'facebook'
              },
              {
                name: 'Twitter',
                value: 'twitter'
              },
              {
                name: 'GitHub',
                value: 'github'
              },
              {
                name: 'Auth0',
                value: 'auth0'
              }
            ]
          },
          {
            name: 'service',
            type: 'input',
            when: !ctx.service,
            message: 'What is your authentication service name?',
            default: 'user'
          },
          {
            name: 'path',
            type: 'input',
            when: !ctx.path,
            message: 'What path should the service be registered on?',
            default: 'users'
          }
        ]
      )
    )
    .then(async (ctx) => {
      const serviceContext = await serviceGenerator({
        ...ctx,
        name: ctx.service,
        isEntityService: true
      })

      return {
        ...ctx,
        entity: ctx.service,
        ...serviceContext
      }
    })
    .then(runGenerators(__dirname, 'templates'))
    .then((ctx) => {
      const dependencies: string[] = []

      dependencies.push('@feathersjs/authentication-oauth')

      if (ctx.authStrategies.includes('local')) {
        dependencies.push('@feathersjs/authentication-local')
      }

      if (ctx.dependencies) {
        return {
          ...ctx,
          dependencies: [...ctx.dependencies, ...dependencies]
        }
      }

      return install<AuthenticationGeneratorContext>(
        addVersions(dependencies, ctx.dependencyVersions),
        false,
        ctx.feathers.packager
      )(ctx)
    })
