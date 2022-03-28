import { generator, runGenerators } from '@feathershq/pinion'
import _ from 'lodash'
import { FeathersBaseContext } from '../index'

export interface ServiceGeneratorContext extends FeathersBaseContext {
  name: string,
  path: string,
  folder: string[],
  camelName: string,
  className: string,
  kebabName: string,
  relative: string,
  type: 'custom'
}

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(async ctx => {
    const { name }: ServiceGeneratorContext = await ctx.pinion.prompt([{
      name: 'name',
      type: 'input',
      when: !ctx.name,
      message: 'What is the name of your service?'
    }])
    const camelName = _.camelCase(name);
    const className = `${_.upperFirst(camelName)}Service`;
    const kebabName = _.kebabCase(name);
    const { path }: ServiceGeneratorContext = await ctx.pinion.prompt([{
      name: 'path',
      type: 'input',
      when: !ctx.path,
      message: 'Which path should the service be registered on?',
      default: `${_.kebabCase(name)}`
    }])
    const pathElements = path.split('/').filter(el => el !== '')
    const relative = pathElements.map(() => '..').join('/');
    const folder = pathElements.slice(0, pathElements.length - 1)

    return {
      name,
      path,
      folder,
      camelName,
      className,
      kebabName,
      relative,
      ...ctx
    }
  })
  .then(runGenerators(__dirname, ({ pkg }: ServiceGeneratorContext) => pkg.feathers.language))
