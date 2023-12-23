import type { PinionContext } from '@feathershq/pinion'
import { generator, loadJSON, writeJSON } from '@feathershq/pinion'

interface Context extends PinionContext {
  pkg: any
  tsconfig: any
}

// A generator that rewrites the package.json and tsconfig.json files for ESM builds
export const generate = (context: Context) =>
  generator(context)
    .then(loadJSON('package.json', (pkg) => ({ pkg })))
    .then(loadJSON('tsconfig.json', (tsconfig) => ({ tsconfig })))
    .then(
      writeJSON<Context>(
        ({ pkg }) => ({
          ...pkg,
          module: './esm/index.js',
          main: './lib/index.js',
          types: './types/index.d.ts',
          exports: {
            '.': {
              import: './esm/index.js',
              require: './lib/index.js',
              types: './types/index.d.ts'
            }
          },
          files: [
            'CHANGELOG.md',
            'LICENSE',
            'README.md',
            'src/**',
            'lib/**',
            'types/**',
            'esm/**',
            '*.d.ts',
            '*.js'
          ],
          engines: {
            node: '>= 18'
          },
          scripts: {
            ...pkg.scripts,
            'compile:esm':
              'shx rm -rf esm/ && tsc --outDir esm/ --module esnext && shx echo \'{ "type": "module" }\' > esm/package.json',
            'compile:cjs':
              'npx shx rm -rf types/ lib/ && tsc && shx echo \'{ "type": "commonjs" }\' > lib/package.json',
            compile: 'npm run compile:cjs && npm run compile:esm && npm run pack'
          }
        }),
        'package.json',
        { force: true }
      )
    )
    .then(
      writeJSON<Context>(
        ({ tsconfig }) => ({
          ...tsconfig,
          compilerOptions: {
            declarationDir: './types',
            outDir: 'lib'
          }
        }),
        'tsconfig.json',
        { force: true }
      )
    )
