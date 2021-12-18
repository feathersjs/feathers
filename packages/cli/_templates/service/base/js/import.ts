import { join } from 'path'
import { VariablesService } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.lib, 'services', 'index.js')
  const body = `
import { ${context.camelName} } from './${context.path}.js';
`

  return { 
    body, 
    to,
    inject: true,
    prepend: true,
    skipIf: `import { ${context.camelName} }`
  }
}