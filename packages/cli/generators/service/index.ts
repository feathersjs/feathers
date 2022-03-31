import { generator, runGenerator, runGenerators } from '@feathershq/pinion'
import _ from 'lodash'
import { join } from 'path'
import { FeathersBaseContext } from '../index'

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
  type: 'custom'|'mongodb'|'sequelize'
}

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(async ctx => {
    const { name }: ServiceGeneratorContext = await ctx.pinion.prompt([{
      name: 'name',
      type: 'input',
      when: !ctx.name,
      message: 'What is the name of your service?'
    }])
    const { path, type }: ServiceGeneratorContext = await ctx.pinion.prompt([{
      name: 'path',
      type: 'input',
      when: !ctx.path,
      message: 'Which path should the service be registered on?',
      default: `${_.kebabCase(name)}`
    }, {
      name: 'type',
      type: 'list',
      when: !ctx.type,
      message: 'What kind of service is it?',
      default: ctx.pkg?.feathers.database,
      choices: [
        { value: 'custom', name: 'A custom service' },
        { value: 'sequelize', name: 'SQL (Sequelize)' },
        { value: 'mongodb', name: 'MongoDB' }
      ]
    }])
    const kebabName = _.kebabCase(name);
    const camelName = _.camelCase(name);
    const upperName = _.upperFirst(camelName);
    const className = `${upperName}Service`;

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
      relative,
      ...ctx
    }
  })
  .then(runGenerators<ServiceGeneratorContext>(__dirname, ({ pkg }) => pkg.feathers.language))
  .then(runGenerator<ServiceGeneratorContext>(({ pkg, type }) =>
    join(__dirname, pkg.feathers.language, 'type', `${type}.tpl`)
  ))
