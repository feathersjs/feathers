import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(writeJSON<AppGeneratorContext>(({ lib }) => ({
    'ts-node': {
      files: true
    },
    compilerOptions: {
      target: 'es2020',
      module: 'commonjs',
      outDir: './lib',
      rootDir: `./${lib}`,
      strict: true,
      esModuleInterop: true
    },
    exclude: [
      'test'
    ]
  }), toFile('tsconfig.json')))
