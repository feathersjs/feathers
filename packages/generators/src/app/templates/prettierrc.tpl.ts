import { toFile, writeJSON } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../index.js'
import { PRETTIERRC } from '../../commons.js'

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(
    writeJSON<AppGeneratorContext>(
      (ctx) => ({
        ...PRETTIERRC,
        parser: ctx.language === 'ts' ? 'typescript' : 'babel'
      }),
      toFile('.prettierrc')
    )
  )
