import { join } from 'path'
import { VariablesService } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.lib, 'services', 'index.ts')
  const body = `
import { ${context.camelName} } from './${context.path}';
`

  return { 
    body, 
    to,
    inject: true,
    prepend: true,
    skipIf: `import { ${context.camelName} }`
  }
}