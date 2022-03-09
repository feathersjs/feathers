import { fromFile, generator, toFile, loadJSON, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(loadJSON(fromFile('package.json'), pkg => ({ pkg })))
  .then(writeJSON(({ pkg, lib }: AppGeneratorContext) => ({
    ...pkg,
    type: 'module',
    scripts: {
      ...pkg.scripts,
      start: `node ${lib}`,
      dev: `nodemon ${lib}/`,
      test: 'mocha test/ --recursive --exit'
    }
  }), toFile('package.json')))
