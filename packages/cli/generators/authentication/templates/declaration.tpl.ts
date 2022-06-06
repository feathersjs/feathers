import { generator, inject, before, toFile, when, append } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const paramsTemplate = ({
  entity
}: AuthenticationGeneratorContext) => `declare module '@feathersjs/feathers' {
  interface Params {
    ${entity}: ${}Result
  }
}`

export const generate = (ctx: AuthenticationGeneratorContext) => generator(ctx)
  .then(when(ctx => ctx.language === 'ts', inject(paramsTemplate, append(), toFile<AuthenticationGeneratorContext>(ctx => ctx.lib, 'declarations.ts'))))
