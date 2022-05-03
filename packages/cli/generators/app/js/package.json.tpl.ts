import { generator, mergeJSON, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(mergeJSON(({ pkg, lib }: AppGeneratorContext) => ({
    ...pkg,
    type: 'module',
    scripts: {
      ...pkg.scripts,
      start: `node ${lib}`,
      dev: `nodemon ${lib}/`,
      test: 'mocha test/ --recursive --exit'
    }
  }), toFile('package.json')))
