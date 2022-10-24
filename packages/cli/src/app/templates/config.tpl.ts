import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const defaultConfig = ({}: AppGeneratorContext) => ({
  host: 'localhost',
  port: 3030,
  public: './public/',
  origins: ['http://localhost:3030'],
  paginate: {
    default: 10,
    max: 50
  }
})

const customEnvironment = {
  port: {
    __name: 'PORT',
    __format: 'number'
  },
  host: 'HOSTNAME'
}

const testConfig = {
  port: 8998
}

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx)
    .then(writeJSON(defaultConfig, toFile('config', 'default.json')))
    .then(writeJSON(testConfig, toFile('config', 'test.json')))
    .then(writeJSON(customEnvironment, toFile('config', 'custom-environment-variables.json')))
