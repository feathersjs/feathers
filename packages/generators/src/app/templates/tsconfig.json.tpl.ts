import { toFile, when, writeJSON } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../index.js'

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(
    when<AppGeneratorContext>(
      (ctx) => ctx.language === 'ts',
      writeJSON<AppGeneratorContext>(
        ({ lib }) => ({
          'ts-node': {
            files: true
          },
          compilerOptions: {
            target: 'es2020',
            module: 'commonjs',
            outDir: './lib',
            rootDir: `./${lib}`,
            declaration: true,
            strict: true,
            esModuleInterop: true,
            sourceMap: true
          },
          include: [lib],
          exclude: ['test']
        }),
        toFile('tsconfig.json')
      )
    )
  )
