import { sep, join } from 'path'
import { PackageJson } from 'type-fest'
import chalk from 'chalk'
import {
  generator, prompt, runGenerators, loadJSON, fromFile, install, copyFiles, toFile
} from '@feathershq/pinion'
import { FeathersBaseContext, FeathersAppInfo, initializeBaseContext } from '../commons'
import { generate as authenticationGenerator } from '../authentication'
import { generate as connectionGenerator } from '../connection'

type DependencyVersions = { [key: string]: string }

const addVersions = (dependencies: string[], versions: DependencyVersions) =>
  dependencies.map(dep => `${dep}@${versions[dep] ? versions[dep] : 'latest'}`)

export interface AppGeneratorData extends FeathersAppInfo {
  /**
   * The application name
   */
  name: string
  /**
   * A short description of the app
   */
  description: string
}

export type AppGeneratorContext = FeathersBaseContext & AppGeneratorData & {
  dependencyVersions: DependencyVersions
  dependencies: string[]
  devDependencies: string[]
}

export type AppGeneratorArguments = FeathersBaseContext & Partial<AppGeneratorData>

export const generate = (ctx: AppGeneratorArguments) => generator(ctx)
  .then(loadJSON(join(__dirname, '..', '..', 'package.json'), (pkg: PackageJson) => ({
    dependencyVersions: pkg.devDependencies,
    dependencies: [],
    devDependencies: []
  })))
  .then(prompt<AppGeneratorArguments, AppGeneratorContext>(ctx => [{
    name: 'language',
    type: 'list',
    message: 'Do you want to use JavaScript or TypeScript?',
    when: !ctx.language,
    choices: [
      { name: 'TypeScript', value: 'ts'  },
      { name: 'JavaScript', value: 'js' }
    ]
  }, {
    name: 'name',
    type: 'input',
    when: !ctx.name,
    message: 'What is the name of your application?',
    default: ctx.cwd.split(sep).pop()
  }, {
    name: 'description',
    type: 'input',
    when: !ctx.description,
    message: 'Write a short description'
  }, {
    type: 'list',
    name: 'framework',
    when: !ctx.framework,
    message: 'Which HTTP framework do you want to use?',
    choices: [
      { value: 'koa', name: `KoaJS ${chalk.grey('(recommended)')}` },
      { value: 'express', name: 'Express' }
    ]
  }, {
    type: 'checkbox',
    name: 'transports',
    when: !ctx.transports,
    message: 'What APIs do you want to offer?',
    choices: [
      { value: 'rest', name: 'HTTP (REST)', checked: true },
      { value: 'websockets', name: 'Real-time (websockets)', checked: true }
    ]
  }, {
    name: 'packager',
    type: 'list',
    when: !ctx.packager,
    message: 'Which package manager are you using?',
    choices: [
      { value: 'npm', name: 'npm' },
      { value: 'yarn', name: 'Yarn'  }
    ]
  }, {
    name: 'database',
    type: 'list',
    when: !ctx.database,
    message: 'What is your main database?',
    suffix: chalk.grey(' Other databases can be added at any time'),
    choices: [
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'knex', name: 'SQL (PostgreSQL, SQLite etc.)' },
      { value: 'custom', name: 'Custom services/another database' }
    ]
  }]))
  .then(runGenerators(__dirname, 'templates'))
  .then(copyFiles(fromFile(__dirname, 'static'), toFile('.')))
  .then(initializeBaseContext())
  .then(async ctx => {
    if (ctx.database === 'custom') {
      return ctx
    }

    const { dependencies } = await connectionGenerator(ctx)

    return {
      ...ctx,
      dependencies
    }
  })
  .then(async ctx => {
    const { dependencies } = await authenticationGenerator({
      ...ctx,
      service: 'users',
      entity: 'user'
    })

    return {
      ...ctx,
      dependencies
    }
  })
  .then(install<AppGeneratorContext>(({
    transports, framework, dependencyVersions, dependencies
  }) => {
    const hasSocketio = transports.includes('websockets')

    dependencies.push(
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/schema',
      '@feathersjs/configuration',
      '@feathersjs/transport-commons',
      '@feathersjs/authentication',
      'winston'
    );

    if (hasSocketio) {
      dependencies.push('@feathersjs/socketio');
    }

    if (framework === 'koa') {
      dependencies.push(
        '@feathersjs/koa',
        'koa-static'
      );
    }

    if (framework === 'express') {
      dependencies.push(
        '@feathersjs/express',
        'compression',
        'helmet'
      );
    }

    return addVersions(dependencies, dependencyVersions)
  }))
  .then(install<AppGeneratorContext>(({ language, framework, devDependencies, dependencyVersions }) => {
    devDependencies.push(
      'nodemon',
      'axios',
      'mocha'
    );

    if (language === 'ts') {
      devDependencies.push(
        '@types/mocha',
        framework === 'koa' ? '@types/koa-static' : '@types/compression',
        '@types/node',
        'nodemon',
        'ts-node',
        'typescript',
        'shx'
      );
    }

    return addVersions(devDependencies, dependencyVersions)
  }, true))
