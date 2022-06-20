import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const defaultConfig = ({}: AppGeneratorContext) => ({
  host: 'localhost',
  port: 3030,
  public: './public/',
  paginate: {
    default: 10,
    max: 50
  }
})

const testConfig = {
  port: 8998
}

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx)
    .then(writeJSON(defaultConfig, toFile('config', 'default.json')))
    .then(writeJSON(testConfig, toFile('config', 'test.json')))
