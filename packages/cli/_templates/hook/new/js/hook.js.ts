import { join } from 'path'
import { VariablesHook } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesHook>): RenderResult {
  const to = join(context.h.lib, 'hooks', `${context.name}.js`)
  const body = `
export const ${ context.h._.camelCase(context.name)} = async (context, next) => {
  // Do things before
  await next();
  // Do things after
}
`

  return { 
    body, 
    to
  }
}