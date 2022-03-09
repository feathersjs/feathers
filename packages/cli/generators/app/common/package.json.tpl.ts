import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const packageJson = ({
  name, description, language, packager, database, framework, transports, lib
}: AppGeneratorContext) => ({
  name,
  description,
  version: '0.0.0',
  homepage: '',
  private: true,
  keywords: [ 'feathers' ],
  author: {},
  contributors: [] as string[],
  bugs: {},
  engines: {
    node: `>= ${process.version.substring(1)}`
  },
  feathers: {
    language,
    packager,
    database,
    framework,
    transports
  },
  directories: {
    lib,
    test: 'test'
  },
  main: `${lib}/`
})

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(writeJSON(packageJson, toFile('package.json')))
