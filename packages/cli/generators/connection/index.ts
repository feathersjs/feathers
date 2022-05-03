import { generator, runGenerator, prompt, install, mergeJSON, toFile } from '@feathershq/pinion'
import chalk from 'chalk'
import { FeathersBaseContext } from '../index'

export interface ConnectionGeneratorContext extends FeathersBaseContext {
  database: string
  connectionString: string
  name: string
  dependencies: string[]
}

export const generate = (ctx: ConnectionGeneratorContext) => generator(ctx)
  .then(prompt<ConnectionGeneratorContext>(({ database }) => [{
    name: 'database',
    type: 'list',
    when: !database,
    message: 'Which database are you connecting to?',
    suffix: chalk.grey(' Other databases can be added at any time'),
    choices: [
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'knex', name: 'SQL (PostgreSQL, SQLite etc.)' },
      { value: 'custom', name: 'Custom services/another database' }
    ]
  }]))
  .then(prompt<ConnectionGeneratorContext>(({ connectionString, database, name }) =>
    database !== 'custom' ? [{
      name: 'connectionString',
      type: 'input',
      when: !connectionString,
      message: 'Enter your database connection string',
      default: `mongodb://localhost:27017/${name}`
    }] : [])
  )
  .then(runGenerator<ConnectionGeneratorContext>(
    __dirname,
    ({ feathers: { language } }) => language,
    ({ database, feathers: { language } }) => `${database}.${language}.tpl`)
  )
  .then(mergeJSON<ConnectionGeneratorContext>(({ connectionString }) => ({
    database: connectionString
  }), toFile('config', 'default.json')))
  .then((ctx: ConnectionGeneratorContext) => {
    const dependencies: string[] = []

    if (ctx.database === 'mongodb') {
      dependencies.push('@feathersjs/mongodb', 'mongodb')
    }

    if(ctx.dependencies) {
      return {
        ...ctx,
        dependencies: [...ctx.dependencies, ...dependencies]
      }
    }

    return install<ConnectionGeneratorContext>(dependencies)(ctx)
  })
