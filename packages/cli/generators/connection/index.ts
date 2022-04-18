import { generator, runGenerator } from '@feathershq/pinion'
import { AppGeneratorContext } from '../app'

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(runGenerator<AppGeneratorContext>(
    __dirname,
    ({ language }) => language,
    ({ database, language }) => `${database}.${language}.tpl`)
  )
  // .then(install<AppGe(['mongodb']))
