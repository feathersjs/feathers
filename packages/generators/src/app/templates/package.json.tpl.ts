import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const jsPackageJson = (lib: string) => ({
  type: 'module',
  scripts: {
    start: `node ${lib}`,
    dev: `nodemon ${lib}/`,
    prettier: 'npx prettier "**/*.js" --write',
    mocha: 'cross-env NODE_ENV=test mocha test/ --recursive --exit',
    test: 'npm run mocha',
    'bundle:client': 'npm pack --pack-destination ./public'
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
    test: 'npm run mocha',
    'bundle:client': 'npm run compile && npm pack --pack-destination ./public'
  }
})

const packageJson = ({
  name,
  description,
  client,
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
  ...(client
    ? {
        files: ['lib/client.js', 'lib/**/*.d.ts', 'lib/**/*.shared.js'],
        main: language === 'ts' ? 'lib/client' : `${lib}/client`
      }
    : {
        main: 'lib/index'
      }),
  ...(language === 'ts' ? tsPackageJson(lib) : jsPackageJson(lib))
})

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(writeJSON(packageJson, toFile('package.json')))
