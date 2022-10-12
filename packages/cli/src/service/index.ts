import _ from 'lodash'
import { generator, runGenerator, runGenerators, prompt } from '@feathershq/pinion'

import {
  checkPreconditions,
  FeathersBaseContext,
  getDatabaseAdapter,
  initializeBaseContext
} from '../commons'

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
        ({ name, path, type, schema, authentication, isEntityService, feathers }) => [
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
            message: 'What kind of service is it?',
            default: getDatabaseAdapter(feathers?.database),
            choices: [
              {
                value: 'knex',
                name: 'SQL'
              },
              {
                value: 'mongodb',
                name: 'MongoDB'
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
            default: feathers?.schema,
            choices: [
              {
                value: 'typebox',
                name: 'TypeBox'
              },
              {
                value: 'json',
                name: 'JSON schema'
              },
              {
                value: false,
                name: 'No schema'
              }
            ]
          }
        ]
      )
    )
    .then(async (ctx): Promise<ServiceGeneratorContext> => {
      const { name, path, type } = ctx
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
        ...ctx
      }
    })
    .then(runGenerators<ServiceGeneratorContext>(__dirname, 'templates'))
    .then(runGenerator<ServiceGeneratorContext>(__dirname, 'type', ({ type }) => `${type}.tpl`))
