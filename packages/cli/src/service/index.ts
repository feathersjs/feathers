import _ from 'lodash'
import { generator, runGenerator, runGenerators, prompt } from '@feathershq/pinion'

import { FeathersBaseContext } from '../commons'

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
   * Indicates how many file paths we should go up to import other things (e.g. `../../`)
   */
  relative: string
  /**
   * The chosen service type
   */
  type: 'knex' | 'mongodb' | 'custom'
  /**
   * Wether this service uses authentication
   */
  authentication: boolean
  /**
   * Set to true if this service is for an authentication entity
   */
  isEntityService?: boolean
  /**
   * The name of the schema file
   */
  schemaPath: string
  /**
   * The name of the resolver file
   */
  resolverPath: string
}

/**
 * Parameters the generator is called with
 */
export type ServiceGeneratorArguments = FeathersBaseContext &
  Partial<Pick<ServiceGeneratorContext, 'name' | 'path' | 'type' | 'authentication' | 'isEntityService'>>

export const generate = (ctx: ServiceGeneratorArguments) =>
  generator(ctx)
    .then(
      prompt<ServiceGeneratorArguments, ServiceGeneratorContext>(
        ({ name, path, type, authentication, isEntityService }) => [
          {
            name: 'name',
            type: 'input',
            when: !name,
            message: 'What is the name of your service?'
          },
          {
            name: 'path',
            type: 'input',
            when: !path,
            message: 'Which path should the service be registered on?',
            default: (answers: ServiceGeneratorArguments) => `${_.kebabCase(answers.name)}`
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
            default: ctx.feathers.database,
            choices: [
              {
                value: 'mongodb',
                name: 'MongoDB'
              },
              {
                value: 'knex',
                name: 'SQL',
                disabled: false
              },
              {
                value: 'custom',
                name: 'A custom service'
              }
            ]
          }
        ]
      )
    )
    .then(async (ctx) => {
      const { name, path, type } = ctx
      const kebabName = _.kebabCase(name)
      const camelName = _.camelCase(name)
      const upperName = _.upperFirst(camelName)
      const className = `${upperName}Service`

      const pathElements = path.split('/').filter((el) => el !== '')
      const relative = pathElements.map(() => '..').join('/')
      const folder = _.initial(pathElements)
      const schemaPath = `schemas/${folder.join('/')}/${kebabName}.schema`
      const resolverPath = `resolvers/${folder.join('/')}/${kebabName}.resolver`

      return {
        name,
        type,
        path,
        folder,
        upperName,
        className,
        kebabName,
        camelName,
        relative,
        resolverPath,
        schemaPath,
        ...ctx
      }
    })
    .then(runGenerators<ServiceGeneratorContext>(__dirname, 'templates'))
    .then(runGenerator<ServiceGeneratorContext>(__dirname, 'type', ({ type }) => `${type}.tpl`))
