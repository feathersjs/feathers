import { generator, runGenerator, prompt, install, mergeJSON, toFile, when } from '@feathershq/pinion'
import chalk from 'chalk'
import {
  FeathersBaseContext,
  DatabaseType,
  getDatabaseAdapter,
  addVersions,
  checkPreconditions,
  initializeBaseContext
} from '../commons'

export interface ConnectionGeneratorContext extends FeathersBaseContext {
  name?: string
  database: DatabaseType
  connectionString: string
  dependencies: string[]
}

export type ConnectionGeneratorArguments = FeathersBaseContext &
  Partial<Pick<ConnectionGeneratorContext, 'database' | 'connectionString' | 'name'>>

export const defaultConnectionString = (type: DatabaseType, name: string) => {
  const connectionStrings = {
    mongodb: `mongodb://127.0.0.1:27017/${name}`,
    mysql: `mysql://root:@localhost:3306/${name}`,
    postgresql: `postgres://postgres:@localhost:5432/${name}`,
    sqlite: `${name}.sqlite`,
    mssql: `mssql://root:password@localhost:1433/${name}`,
    other: ''
  }

  return connectionStrings[type]
}

export const prompts = ({ database, connectionString, pkg, name }: ConnectionGeneratorArguments) => [
  {
    name: 'database',
    type: 'list',
    when: !database,
    message: 'Which database are you connecting to?',
    suffix: chalk.grey(' Databases can be added at any time'),
    choices: [
      { value: 'sqlite', name: 'SQLite' },
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'postgresql', name: 'PostgreSQL' },
      { value: 'mysql', name: 'MySQL/MariaDB' },
      { value: 'mssql', name: 'Microsoft SQL' },
      {
        value: 'other',
        name: `Another database ${chalk.grey('(not configured automatically, use with custom services)')}`
      }
    ]
  },
  {
    name: 'connectionString',
    type: 'input',
    when: (answers: ConnectionGeneratorContext) =>
      !connectionString && database !== 'other' && answers.database !== 'other',
    message: 'Enter your database connection string',
    default: (answers: ConnectionGeneratorContext) =>
      defaultConnectionString(answers.database, answers.name || name || pkg.name)
  }
]

export const DATABASE_CLIENTS = {
  mongodb: 'mongodb',
  sqlite: 'sqlite3',
  postgresql: 'pg',
  mysql: 'mysql',
  mssql: 'mssql'
}

export const getDatabaseClient = (database: DatabaseType) =>
  database === 'other' ? null : DATABASE_CLIENTS[database]

export const generate = (ctx: ConnectionGeneratorArguments) =>
  generator(ctx)
    .then(initializeBaseContext())
    .then(checkPreconditions())
    .then(prompt<ConnectionGeneratorArguments, ConnectionGeneratorContext>(prompts))
    .then(
      when<ConnectionGeneratorContext>(
        (ctx) => ctx.database !== 'other',
        runGenerator<ConnectionGeneratorContext>(
          __dirname,
          'templates',
          ({ database }) => `${getDatabaseAdapter(database)}.tpl`
        ),
        mergeJSON<ConnectionGeneratorContext>(
          ({ connectionString, database }) =>
            getDatabaseAdapter(database) === 'knex'
              ? {
                  [database]: {
                    client: getDatabaseClient(database),
                    connection: connectionString,
                    ...(database === 'sqlite' ? { useNullAsDefault: true } : {})
                  }
                }
              : {
                  [database]: connectionString
                },
          toFile('config', 'default.json')
        ),
        async (ctx: ConnectionGeneratorContext) => {
          const dependencies: string[] = []
          const adapter = getDatabaseAdapter(ctx.database)
          const dbClient = getDatabaseClient(ctx.database)

          dependencies.push(`@feathersjs/${adapter}`)

          if (adapter === 'knex') {
            dependencies.push('knex')
          }

          dependencies.push(dbClient)

          if (ctx.dependencies) {
            return {
              ...ctx,
              dependencies: [...ctx.dependencies, ...dependencies]
            }
          }

          return install<ConnectionGeneratorContext>(
            addVersions(dependencies, ctx.dependencyVersions),
            false,
            ctx.feathers.packager
          )(ctx)
        }
      )
    )
