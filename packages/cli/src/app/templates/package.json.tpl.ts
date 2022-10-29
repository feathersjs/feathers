import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const jsPackageJson = (lib: string) => ({
  type: 'module',
  scripts: {
    start: `node ${lib}`,
    dev: `nodemon ${lib}/`,
    prettier: 'npx prettier "**/*.js" --write',
    mocha: 'cross-env NODE_ENV=test mocha test/ --recursive --exit',
    test: 'npm run mocha'
  }
})

const tsPackageJson = (lib: string) => ({
  scripts: {
    dev: `nodemon -x ts-node ${lib}/index.ts`,
    compile: 'shx rm -rf lib/ && tsc',
    start: 'node lib/',
    prettier: 'npx prettier "**/*.ts" --write',
    mocha:
      'cross-env NODE_ENV=test mocha test/ --require ts-node/register --recursive --extension .ts --exit',
    test: 'npm run mocha'
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
  test,
  schema
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
    transports,
    schema
  },
  directories: {
    lib,
    test
  },
  main: language === 'ts' ? 'lib/client' : `${lib}/client`,
  ...(language === 'ts' ? tsPackageJson(lib) : jsPackageJson(lib))
})

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(writeJSON(packageJson, toFile('package.json')))
