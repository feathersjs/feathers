import { sep, join } from 'path'
import { PackageJson } from 'type-fest'
import chalk from 'chalk'
import { generator, prompt, runGenerators, loadJSON, fromFile, install } from '@feathershq/pinion'
import { FeathersBaseContext, FeathersAppInfo } from '../index'

type DependencyVersions = { [key: string]: string }

const addVersions = (dependencies: string[], versions: DependencyVersions) =>
  dependencies.map(dep => `${dep}@${versions[dep] ? versions[dep] : 'latest'}`)

export interface AppGeneratorData extends FeathersAppInfo {
  /**
   * The application name
   */
  name: string
  /**
   * THe source file folder
   */
  lib: string
  /**
   * A short description of the app
   */
  description: string
}

export type AppGeneratorContext = FeathersBaseContext & AppGeneratorData & {
  dependencyVersions: DependencyVersions
}

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(loadJSON(join(__dirname, '..', '..', 'package.json'), (pkg: PackageJson) => ({
    dependencyVersions: pkg.devDependencies
  })))
  .then(prompt((ctx: AppGeneratorContext) => [{
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
    message: 'Description'
  }, {
    name: 'database',
    type: 'list',
    when: !ctx.database,
    message: 'What is your main database?',
    suffix: chalk.grey(' Other databases can be added at any time'),
    choices: [
      { value: 'sequelize', name: 'SQL (Sequelize)' },
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'custom', name: 'Custom services/another database' }
    ]
  }, {
    type: 'input',
    name: 'lib',
    when: !ctx.lib,
    message: 'What folder should the source files live in?',
    default: 'src'
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
    type: 'checkbox',
    name: 'transports',
    when: !ctx.transports,
    message: 'What APIs do you want to offer?',
    choices: [
      { value: 'rest', name: 'HTTP (REST)', checked: true },
      { value: 'websockets', name: 'Real-time (Websockets)', checked: true }
    ]
  }, {
    type: 'list',
    name: 'framework',
    when: !ctx.framework,
    message: 'Which HTTP framework do you want to use?',
    choices: [
      { value: 'koa', name: `KoaJS ${chalk.grey('(recommended)')}` },
      { value: 'express', name: 'Express' }
    ]
  }]))
  .then(runGenerators(__dirname, 'common'))
  .then(install(({ transports, database, framework, dependencyVersions }: AppGeneratorContext) => {
    const hasSocketio = transports.includes('websockets')
    const dependencies = [
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/schema',
      '@feathersjs/configuration',
      '@feathersjs/authentication',
      '@feathersjs/transport-commons',
      'winston'
    ];

    if (hasSocketio) {
      dependencies.push('@feathersjs/socketio');
    }

    if (database !== 'custom') {
      dependencies.push(`feathers-${database}`);
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
  .then(install(({ language, framework, dependencyVersions }: AppGeneratorContext) => {
    const devDependencies = [
      'nodemon',
      'axios',
      'mocha'
    ];

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
  .then(loadJSON(fromFile('package.json'), pkg => ({ pkg })))
  .then(runGenerators(__dirname, (ctx: AppGeneratorContext) => ctx.language))
