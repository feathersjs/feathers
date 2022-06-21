import { sep } from 'path'
import chalk from 'chalk'
import {
  generator,
  prompt,
  runGenerators,
  fromFile,
  install,
  copyFiles,
  toFile,
  when
} from '@feathershq/pinion'
import { FeathersBaseContext, FeathersAppInfo, initializeBaseContext, addVersions } from '../commons'
import { generate as authenticationGenerator, prompts as authenticationPrompts } from '../authentication'
import { generate as connectionGenerator, prompts as connectionPrompts } from '../connection'

export interface AppGeneratorData extends FeathersAppInfo {
  /**
   * The application name
   */
  name: string
  /**
   * A short description of the app
   */
  description: string
  /**
   * The selected user authentication strategies
   */
  authStrategies: string[]
  /**
   * The database connection string
   */
  connectionString: string
  /**
   * The source folder where files are put
   */
  lib: string
}

export type AppGeneratorContext = FeathersBaseContext &
  AppGeneratorData & {
    dependencies: string[]
    devDependencies: string[]
  }

export type AppGeneratorArguments = FeathersBaseContext & Partial<AppGeneratorData>

export const generate = (ctx: AppGeneratorArguments) =>
  generator(ctx)
    .then((ctx) => ({
      ...ctx,
      dependencies: [],
      devDependencies: []
    }))
    .then(
      prompt<AppGeneratorArguments, AppGeneratorContext>((ctx) => [
        {
          name: 'language',
          type: 'list',
          message: 'Do you want to use JavaScript or TypeScript?',
          when: !ctx.language,
          choices: [
            { name: 'TypeScript', value: 'ts' },
            { name: 'JavaScript', value: 'js' }
          ]
        },
        {
          name: 'name',
          type: 'input',
          when: !ctx.name,
          message: 'What is the name of your application?',
          default: ctx.cwd.split(sep).pop()
        },
        {
          name: 'description',
          type: 'input',
          when: !ctx.description,
          message: 'Write a short description'
        },
        {
          type: 'list',
          name: 'framework',
          when: !ctx.framework,
          message: 'Which HTTP framework do you want to use?',
          choices: [
            { value: 'koa', name: `KoaJS ${chalk.grey('(recommended)')}` },
            { value: 'express', name: 'Express' }
          ]
        },
        {
          type: 'checkbox',
          name: 'transports',
          when: !ctx.transports,
          message: 'What APIs do you want to offer?',
          choices: [
            { value: 'rest', name: 'HTTP (REST)', checked: true },
            { value: 'websockets', name: 'Real-time', checked: true }
          ]
        },
        {
          name: 'packager',
          type: 'list',
          when: !ctx.packager,
          message: 'Which package manager are you using?',
          choices: [
            { value: 'npm', name: 'npm' },
            { value: 'yarn', name: 'Yarn' }
          ]
        },
        ...connectionPrompts(ctx),
        ...authenticationPrompts({
          ...ctx,
          service: 'users',
          entity: 'user'
        })
      ])
    )
    .then(runGenerators(__dirname, 'templates'))
    .then(copyFiles(fromFile(__dirname, 'static'), toFile('.')))
    .then(initializeBaseContext())
    .then(
      when<AppGeneratorContext>(
        ({ authStrategies }) => authStrategies.length > 0,
        async (ctx) => {
          const { dependencies } = await connectionGenerator(ctx)

          return {
            ...ctx,
            dependencies
          }
        }
      )
    )
    .then(
      when<AppGeneratorContext>(
        ({ authStrategies }) => authStrategies.length > 0,
        async (ctx) => {
          const { dependencies } = await authenticationGenerator({
            ...ctx,
            service: 'users',
            entity: 'user'
          })

          return {
            ...ctx,
            dependencies
          }
        }
      )
    )
    .then(
      install<AppGeneratorContext>(({ transports, framework, dependencyVersions, dependencies }) => {
        const hasSocketio = transports.includes('websockets')

        dependencies.push(
          '@feathersjs/feathers',
          '@feathersjs/errors',
          '@feathersjs/schema',
          '@feathersjs/configuration',
          '@feathersjs/transport-commons',
          '@feathersjs/authentication',
          'winston'
        )

        if (hasSocketio) {
          dependencies.push('@feathersjs/socketio')
        }

        if (framework === 'koa') {
          dependencies.push('@feathersjs/koa', 'koa-static')
        }

        if (framework === 'express') {
          dependencies.push('@feathersjs/express', 'compression', 'helmet')
        }

        return addVersions(dependencies, dependencyVersions)
      })
    )
    .then(
      install<AppGeneratorContext>(({ language, framework, devDependencies, dependencyVersions }) => {
        devDependencies.push('nodemon', 'axios', 'mocha', 'cross-env')

        if (language === 'ts') {
          devDependencies.push(
            '@types/mocha',
            framework === 'koa' ? '@types/koa-static' : '@types/compression',
            '@types/node',
            'nodemon',
            'ts-node',
            'typescript',
            'shx'
          )
        }

        return addVersions(devDependencies, dependencyVersions)
      }, true)
    )
