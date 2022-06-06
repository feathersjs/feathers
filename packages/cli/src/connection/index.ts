import { generator, runGenerator, prompt, install, mergeJSON, toFile } from '@feathershq/pinion'
import chalk from 'chalk'
import { FeathersBaseContext } from '../commons'

export interface ConnectionGeneratorContext extends FeathersBaseContext {
  database: string
  connectionString: string
  dependencies: string[]
}

export type ConnectionGeneratorArguments = FeathersBaseContext &
  Partial<Pick<ConnectionGeneratorContext, 'database' | 'connectionString'>>

export const generate = (ctx: ConnectionGeneratorArguments) =>
  generator(ctx)
    .then(
      prompt<ConnectionGeneratorArguments, ConnectionGeneratorContext>(
        ({ database, connectionString, pkg }) => [
          {
            name: 'database',
            type: 'list',
            when: !database,
            message: 'Which database are you connecting to?',
            suffix: chalk.grey(' Other databases can be added at any time'),
            choices: [
              { value: 'mongodb', name: 'MongoDB' },
              { value: 'knex', name: 'SQL (PostgreSQL, SQLite etc.)' }
            ]
          },
          {
            name: 'connectionString',
            type: 'input',
            when: (answers: ConnectionGeneratorArguments) =>
              !connectionString && answers.database !== 'custom',
            message: 'Enter your database connection string',
            default: `mongodb://localhost:27017/${pkg.name}`
          }
        ]
      )
    )
    .then(
      runGenerator<ConnectionGeneratorContext>(__dirname, 'templates', ({ database }) => `${database}.tpl`)
    )
    .then(
      mergeJSON<ConnectionGeneratorContext>(
        ({ connectionString }) => ({
          database: connectionString
        }),
        toFile('config', 'default.json')
      )
    )
    .then((ctx: ConnectionGeneratorContext) => {
      const dependencies: string[] = []

      if (ctx.database === 'mongodb') {
        dependencies.push('@feathersjs/mongodb', 'mongodb')
      }

      if (ctx.dependencies) {
        return {
          ...ctx,
          dependencies: [...ctx.dependencies, ...dependencies]
        }
      }

      return install(dependencies)(ctx)
    })
