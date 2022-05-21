import _ from 'lodash'
import { generator, runGenerator, runGenerators, prompt } from '@feathershq/pinion'

import { FeathersBaseContext } from '../commons'

export interface ServiceGeneratorContext extends FeathersBaseContext {
  /**
   * The chosen service name
   */
  name: string,
  /**
   * The path the service is registered on
   */
  path: string,
  /**
   * The list of subfolders this service is in
   */
  folder: string[],
  /**
   * The `camelCase` service name starting with a lowercase letter
   */
  camelName: string,
  /**
   * The `CamelCase` service name starting with an uppercase letter
   */
  upperName: string,
  /**
   * The service class name combined as `CamelCaseService`
   */
  className: string,
  /**
   * A kebab-cased (filename friendly) version of the service name
   */
  kebabName: string,
  /**
   * Indicates how many file paths we should go up to import other things (e.g. `../../`)
   */
  relative: string,
  /**
   * The chosen service type
   */
  type: 'knex'|'mongodb'|'custom'
}

/**
 * Parameters the generator is called with
 */
export type ServiceGeneratorArguments = FeathersBaseContext & Partial<Pick<ServiceGeneratorContext, 'name'|'path'|'type'>>

export const generate = (ctx: ServiceGeneratorArguments) => generator(ctx)
  .then(prompt<ServiceGeneratorArguments>(({ name }) => [{
      name: 'name',
      type: 'input',
      when: !name,
      message: 'What is the name of your service?'
    }]))
  .then(prompt<ServiceGeneratorArguments>(({ name, path, type }) => [{
    name: 'path',
    type: 'input',
    when: !path,
    message: 'Which path should the service be registered on?',
    default: `${_.kebabCase(name)}`
  }, {
    name: 'type',
    type: 'list',
    when: !type,
    message: 'What kind of service is it?',
    choices: [
      {
        value: 'custom',
        name: 'A custom service',
        checked: ctx?.feathers.database === 'custom'
      },
      {
        value: 'knex',
        name: 'SQL',
        checked: ctx?.feathers.database === 'knex'
      },
      {
        value: 'mongodb',
        name: 'MongoDB',
        checked: ctx?.feathers.database === 'mongodb'
      }
    ]
  }]))
  .then(async ctx => {
    const { name, path, type } = ctx
    const kebabName = _.kebabCase(name)
    const camelName = _.camelCase(name)
    const upperName = _.upperFirst(camelName)
    const className = `${upperName}Service`

    const pathElements = path.split('/').filter(el => el !== '')
    const relative = pathElements.map(() => '..').join('/');
    const folder = _.initial(pathElements)

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
      ...ctx
    }
  })
  .then(runGenerators<ServiceGeneratorContext>(__dirname, 'templates'))
  .then(runGenerator<ServiceGeneratorContext>(__dirname, 'type', ({ type }) => `${type}.tpl`))
