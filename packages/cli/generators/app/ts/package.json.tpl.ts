import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(writeJSON(({ pkg, lib }: AppGeneratorContext) => ({
    ...pkg,
    scripts: {
      ...pkg.scripts,
      dev: `nodemon -x ts-node ${lib}/index.ts`,
      compile: 'shx rm -rf lib/ && tsc',
      start: 'npm run compile && node lib/',
      test: 'mocha test/ --require ts-node/register --recursive --extension .ts --exit'
    }
  }), toFile('package.json'), { force: true }))
