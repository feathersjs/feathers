import { join } from 'path'
import { VariablesService } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.lib, 'services', 'index.ts')
  const body = `
  app.configure(${context.camelName});
  `

  return { 
    body, 
    to,
    inject: true,
    skipIf: `app.configure\\(${context.camelName}\\)`,
    after: 'export default'
  }
}