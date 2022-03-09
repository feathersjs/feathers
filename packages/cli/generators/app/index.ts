import { sep } from 'path'
import chalk from 'chalk'
import { generator, prompt, runGenerators } from '@feathershq/pinion'
import { FeathersBaseContext } from '../index'

export interface AppGeneratorContext extends FeathersBaseContext {
  language: 'ts'|'js'
  name: string
  description: string
  database: 'sequelize'|'mongodb'|'custom'
  lib: string
  packager: 'yarn'|'npm'
  transports: 'rest'|'websockets'[]
  framework: 'koa'|'express'
}

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(ctx => ({
    ...ctx,
    name: ctx.cwd.split(sep).pop()
  }))
  .then(prompt((ctx: AppGeneratorContext) => [{
    name: 'language',
    type: 'list',
    message: 'Do you want to use JavaScript or TypeScript?',
    choices: [
      { name: 'TypeScript', value: 'ts'  },
      { name: 'JavaScript', value: 'js' }
    ]
  }, {
    name: 'name',
    type: 'input',
    message: 'What is the name of your application?',
    default: ctx.name
  }, {
    name: 'description',
    type: 'input',
    message: 'Description'
  }, {
    name: 'database',
    type: 'list',
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
    message: 'What folder should the source files live in?',
    default: 'src'
  }, {
    name: 'packager',
    type: 'list',
    message: 'Which package manager are you using?',
    choices: [
      { value: 'npm', name: 'npm' },
      { value: 'yarn', name: 'Yarn'  }
    ]
  }, {
    type: 'checkbox',
    name: 'transports',
    message: 'What APIs do you want to offer?',
    choices: [
      { value: 'rest', name: 'HTTP (REST)', checked: true },
      { value: 'websockets', name: 'Real-time (Websockets)', checked: true }
    ]
  }, {
    type: 'list',
    name: 'framework',
    message: 'Which HTTP framework do you want to use?',
    choices: [
      { value: 'koa', name: `KoaJS ${chalk.grey('(recommended)')}` },
      { value: 'express', name: 'Express' }
    ]
  }]))
  .then(runGenerators(__dirname, 'common'))
  .then(runGenerators(__dirname, (ctx: AppGeneratorContext) => ctx.language))
