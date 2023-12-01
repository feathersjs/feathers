import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { ModuleContext } from '../package'

export const generate = (context: ModuleContext) =>
  generator(context).then(
    writeJSON(
      {
        extends: '../../tsconfig',
        include: ['src/**/*.ts'],
        compilerOptions: {
          outDir: 'lib'
        }
      },
      toFile(context.packagePath, 'tsconfig.json')
    )
  )
