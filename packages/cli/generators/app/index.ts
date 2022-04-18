import { sep, join } from 'path'
import { PackageJson } from 'type-fest'
import chalk from 'chalk'
import { generator, prompt, runGenerators, loadJSON, fromFile, install, runGenerator, copyFiles, toFile } from '@feathershq/pinion'
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
  /**
   * A list of selected authentication methods
   */
  authStrategies: string[]
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
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'sequelize', name: 'SQL (Sequelize)' },
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
    name: 'authStrategies',
    when: !ctx.authStrategies,
    message: 'Which user authentication methods do you want to provide?',
    suffix: chalk.grey(' Other methods and providers can be added at any time.'),
    choices: [{
      name: 'Email + Password',
      value: 'local',
      checked: true
    }, {
      name: 'Google',
      value: 'google'
    }, {
      name: 'Facebook',
      value: 'facebook'
    }, {
      name: 'Twitter',
      value: 'twitter'
    }, {
      name: 'GitHub',
      value: 'github'
    }, {
      name: 'Auth0',
      value: 'auth0'
    }]
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
  .then(install(({ transports, database, framework, dependencyVersions, authStrategies }: AppGeneratorContext) => {
    const hasSocketio = transports.includes('websockets')
    const dependencies = [
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/schema',
      '@feathersjs/configuration',
      '@feathersjs/authentication',
      '@feathersjs/transport-commons',
      '@feathersjs/authentication',
      '@feathersjs/authentication-oauth',
      'winston'
    ];

    if (authStrategies.includes('local')) {
      dependencies.push('@feathersjs/authentication-local');
    }

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
  .then(copyFiles(fromFile(__dirname, 'static'), toFile('.')))
  .then(runGenerators(__dirname, (ctx: AppGeneratorContext) => ctx.language))
  .then(runGenerator(__dirname, '..', 'connection', 'index'))
