import { sep } from 'path'
import chalk from 'chalk'
import { generator, prompt, runGenerators, fromFile, install, copyFiles, toFile } from '@feathershq/pinion'
import { FeathersBaseContext, FeathersAppInfo, initializeBaseContext, addVersions } from '../commons'
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
   * The database connection string
   */
  connectionString: string
  /**
   * The source folder where files are put
   */
  lib: string
  /**
   * Generate a client
   */
  client: boolean
}

export type AppGeneratorContext = FeathersBaseContext &
  AppGeneratorData & {
    dependencies: string[]
    devDependencies: string[]
  }

export type AppGeneratorArguments = FeathersBaseContext & Partial<AppGeneratorData>

export const generate = (ctx: AppGeneratorArguments) =>
  generator(ctx)
    .then(initializeBaseContext())
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
          default: ctx.cwd.split(sep).pop(),
          validate: (input) => {
            if (ctx.dependencyVersions[input]) {
              return `Application can not have the same name as a dependency`
            }

            return true
          }
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
            { value: 'yarn', name: 'Yarn' },
            { value: 'pnpm', name: 'pnpm' }
          ]
        },
        {
          name: 'client',
          type: 'confirm',
          when: ctx.client === undefined,
          message: (answers) => `Generate ${answers.language === 'ts' ? 'end-to-end typed ' : ''}client?`,
          suffix: chalk.grey(' Can be used with React, Angular, Vue, React Native, Node.js etc.')
        },
        {
          type: 'list',
          name: 'schema',
          when: !ctx.schema,
          message: 'What is your preferred schema (model) definition format?',
          suffix: chalk.grey(
            ' Schemas allow to type, validate, secure and populate your data and configuration'
          ),
          choices: [
            { value: 'typebox', name: `TypeBox ${chalk.grey('(recommended)')}` },
            { value: 'json', name: 'JSON schema' },
            { value: false, name: `No schema ${chalk.grey('(not recommended)')}` }
          ]
        },
        ...connectionPrompts(ctx)
      ])
    )
    .then(runGenerators(__dirname, 'templates'))
    .then(copyFiles(fromFile(__dirname, 'static'), toFile('.')))
    .then(initializeBaseContext())
    .then(async (ctx) => {
      const { dependencies } = await connectionGenerator(ctx)

      return {
        ...ctx,
        dependencies
      }
    })
    .then(
      install<AppGeneratorContext>(
        ({ transports, framework, dependencyVersions, dependencies, schema }) => {
          const hasSocketio = transports.includes('websockets')

          dependencies.push(
            '@feathersjs/feathers',
            '@feathersjs/errors',
            '@feathersjs/schema',
            '@feathersjs/configuration',
            '@feathersjs/transport-commons',
            '@feathersjs/adapter-commons',
            '@feathersjs/authentication',
            '@feathersjs/authentication-client',
            'winston'
          )

          if (hasSocketio) {
            dependencies.push('@feathersjs/socketio')
          }

          if (framework === 'koa') {
            dependencies.push('@feathersjs/koa')
          }

          if (framework === 'express') {
            dependencies.push('@feathersjs/express', 'compression')
          }

          if (schema === 'typebox') {
            dependencies.push('@feathersjs/typebox')
          }

          return addVersions(dependencies, dependencyVersions)
        },
        false,
        ({ packager }) => packager
      )
    )
    .then(
      install<AppGeneratorContext>(
        ({ language, devDependencies, dependencyVersions }) => {
          devDependencies.push(
            'nodemon',
            'axios',
            'mocha',
            'cross-env',
            'prettier',
            '@feathersjs/cli',
            '@feathersjs/rest-client'
          )

          if (language === 'ts') {
            devDependencies.push('@types/mocha', '@types/node', 'nodemon', 'ts-node', 'typescript', 'shx')
          }

          return addVersions(devDependencies, dependencyVersions)
        },
        true,
        ({ packager }) => packager
      )
    )
