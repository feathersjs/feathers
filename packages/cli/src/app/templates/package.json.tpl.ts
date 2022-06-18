import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const jsPackageJson = (lib: string) => ({
  type: 'module',
  scripts: {
    start: `node ${lib}`,
    dev: `nodemon ${lib}/`,
    test: 'mocha test/ --recursive --exit'
  }
})

const tsPackageJson = (lib: string) => ({
  scripts: {
    dev: `nodemon -x ts-node ${lib}/index.ts`,
    compile: 'shx rm -rf lib/ && tsc',
    start: 'npm run compile && node lib/',
    test: 'mocha test/ --require ts-node/register --recursive --extension .ts --exit'
  }
})

const packageJson = ({
  name,
  description,
  language,
  packager,
  database,
  framework,
  transports,
  lib,
  test
}: AppGeneratorContext) => ({
  name,
  description,
  version: '0.0.0',
  homepage: '',
  private: true,
  keywords: ['feathers'],
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
    test
  },
  main: `${lib}/`,
  browser: language === 'ts' ? 'dist/client' : `${lib}/client`,
  ...(language === 'ts' ? tsPackageJson(lib) : jsPackageJson(lib))
})

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(writeJSON(packageJson, toFile('package.json')))
