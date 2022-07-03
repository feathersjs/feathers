import { generator, toFile, writeJSON } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'
import { PRETTIERRC } from '../../commons'

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(
    writeJSON<AppGeneratorContext>(
      (ctx) => ({
        ...PRETTIERRC,
        parser: ctx.language === 'ts' ? 'typescript' : 'babel'
      }),
      toFile('.prettierrc')
    )
  )
