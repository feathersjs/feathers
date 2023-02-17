import _ from 'lodash'
import { generator, runGenerator, runGenerators, prompt } from '@feathershq/pinion'

import {
  checkPreconditions,
  DATABASE_TYPES,
  FeathersBaseContext,
  fileExists,
  getDatabaseAdapter,
  initializeBaseContext
} from '../commons'
import chalk from 'chalk'

export interface ServiceGeneratorContext extends FeathersBaseContext {
  /**
   * The chosen service name
   */
  name: string
  /**
   * The path the service is registered on
   */
  path: string
  /**
   * The list of subfolders this service is in
   */
  folder: string[]
  /**
   * The `camelCase` service name starting with a lowercase letter
   */
  camelName: string
  /**
   * The `CamelCase` service name starting with an uppercase letter
   */
  upperName: string
  /**
   * The service class name combined as `CamelCaseService`
   */
  className: string
  /**
   * A kebab-cased (filename friendly) version of the service name
   */
  kebabName: string
  /**
   * The actual filename (the last element of the path)
   */
  fileName: string
  /**
   * The kebab-cased name of the path. Will be used for e.g. database names
   */
  kebabPath: string
  /**
   * Indicates how many file paths we should go up to import other things (e.g. `../../`)
   */
  relative: string
  /**
   * The chosen service type
   */
  type: 'knex' | 'mongodb' | 'custom'
  /**
   * Which schema definition format to use
   */
  schema: 'typebox' | 'json' | false
  /**
   * Wether this service uses authentication
   */
  authentication: boolean
  /**
   * Set to true if this service is for an authentication entity
   */
  isEntityService?: boolean
  /**
   * The authentication strategies (if it is an entity service)
   */
  authStrategies: string[]
}

/**
 * Parameters the generator is called with
 */
export type ServiceGeneratorArguments = FeathersBaseContext &
  Partial<
    Pick<ServiceGeneratorContext, 'name' | 'path' | 'type' | 'authentication' | 'isEntityService' | 'schema'>
  >

export const generate = (ctx: ServiceGeneratorArguments) =>
  generator(ctx)
    .then(initializeBaseContext())
    .then(checkPreconditions())
    .then(
      prompt<ServiceGeneratorArguments, ServiceGeneratorContext>(
        ({ name, path, type, schema, authentication, isEntityService, feathers, lib, language }) => {
          const sqlDisabled = DATABASE_TYPES.every(
            (name) => name === 'mongodb' || name === 'other' || !fileExists(lib, `${name}.${language}`)
          )
          const mongodbDisabled = !fileExists(lib, `mongodb.${language}`)

          return [
            {
              name: 'name',
              type: 'input',
              when: !name,
              message: 'What is the name of your service?',
              validate: (input) => {
                if (!input || input === 'authentication') {
                  return 'Invalid service name'
                }

                return true
              }
            },
            {
              name: 'path',
              type: 'input',
              when: !path,
              message: 'Which path should the service be registered on?',
              default: (answers: ServiceGeneratorArguments) => `${_.kebabCase(answers.name)}`,
              validate: (input) => {
                if (!input || input === 'authentication') {
                  return 'Invalid service path'
                }

                return true
              }
            },
            {
              name: 'authentication',
              type: 'confirm',
              when: authentication === undefined && !isEntityService,
              message: 'Does this service require authentication?'
            },
            {
              name: 'type',
              type: 'list',
              when: !type,
              message: 'What database is the service using?',
              default: getDatabaseAdapter(feathers?.database),
              choices: [
                {
                  value: 'knex',
                  name: `SQL${sqlDisabled ? chalk.gray(' (connection not available)') : ''}`,
                  disabled: sqlDisabled
                },
                {
                  value: 'mongodb',
                  name: `MongoDB${mongodbDisabled ? chalk.gray(' (connection not available)') : ''}`,
                  disabled: mongodbDisabled
                },
                {
                  value: 'custom',
                  name: 'A custom service'
                }
              ]
            },
            {
              name: 'schema',
              type: 'list',
              when: schema === undefined,
              message: 'Which schema definition format do you want to use?',
              suffix: chalk.grey(' Schemas allow to type, validate, secure and populate data'),
              default: feathers?.schema,
              choices: (answers: ServiceGeneratorContext) => [
                {
                  value: 'typebox',
                  name: `TypeBox ${chalk.gray(' (recommended)')}`
                },
                {
                  value: 'json',
                  name: 'JSON schema'
                },
                {
                  value: false,
                  name: `No schema${
                    answers.type !== 'custom' ? chalk.gray(' (not recommended with a database)') : ''
                  }`
                }
              ]
            }
          ]
        }
      )
    )
    .then(async (ctx): Promise<ServiceGeneratorContext> => {
      const { name, path, type, authStrategies = [] } = ctx
      const kebabName = _.kebabCase(name)
      const camelName = _.camelCase(name)
      const upperName = _.upperFirst(camelName)
      const className = `${upperName}Service`

      const folder = path.split('/').filter((el) => el !== '')
      const relative = ['', ...folder].map(() => '..').join('/')
      const fileName = _.last(folder)
      const kebabPath = _.kebabCase(path)

      return {
        name,
        type,
        path,
        folder,
        fileName,
        upperName,
        className,
        kebabName,
        camelName,
        kebabPath,
        relative,
        authStrategies,
        ...ctx
      }
    })
    .then(runGenerators<ServiceGeneratorContext>(__dirname, 'templates'))
    .then(runGenerator<ServiceGeneratorContext>(__dirname, 'type', ({ type }) => `${type}.tpl`))
