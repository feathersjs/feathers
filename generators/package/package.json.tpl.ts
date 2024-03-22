import { generator, toFile, writeJSON } from '@featherscloud/pinion'
import { ModuleContext } from '../package'

interface Context extends ModuleContext {}

export const generate = (context: Context) =>
  generator(context).then(
    writeJSON<Context>(
      ({ moduleName, description, name }) => ({
        name: moduleName,
        description,
        version: '0.0.0',
        homepage: 'https://feathersjs.com',
        keywords: ['feathers'],
        license: 'MIT',
        repository: {
          type: 'git',
          url: 'git://github.com/feathersjs/feathers.git',
          directory: `packages/${name}`
        },
        author: {
          name: 'Feathers contributor',
          email: 'hello@feathersjs.com',
          url: 'https://feathersjs.com'
        },
        contributors: [],
        bugs: {
          url: 'https://github.com/feathersjs/feathers/issues'
        },
        engines: {
          node: '>= 20'
        },
        files: ['CHANGELOG.md', 'LICENSE', 'README.md', 'src/**', 'lib/**', 'esm/**'],
        // module: './esm/index.js',
        main: './lib/index.js',
        types: './src/index.ts',
        exports: {
          '.': {
            // import: './esm/index.js',
            require: './lib/index.js',
            types: './src/index.ts'
          }
        },
        scripts: {
          prepublish: 'npm run compile',
          pack: 'npm pack --pack-destination ../generators/test/build',
          compile: 'shx rm -rf lib/ && tsc && npm run pack',
          test: 'mocha --config ../../.mocharc.json --recursive test/**.test.ts test/**/*.test.ts'
        },
        publishConfig: {
          access: 'public'
        },
        dependencies: {},
        devDependencies: {}
      }),
      toFile('packages', context.name, 'package.json')
    )
  )
