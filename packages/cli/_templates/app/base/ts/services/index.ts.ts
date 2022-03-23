import { join } from 'path'
import { VariablesAppBase } from '../..'
import { GeneratorContext, RenderResult } from '../../../../../src'

export function render (context: GeneratorContext<VariablesAppBase>): RenderResult {
  const to = join(context.h.lib, 'services', 'index.ts')
  const body = `
import { Application } from '../declarations';

export default (app: Application) => {
}
`

  return { 
    body, 
    to
  }
}