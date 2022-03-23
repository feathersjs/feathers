import { join } from 'path'
import { VariablesApp } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesApp>): RenderResult {
  const to = join(context.lib, 'config', 'test.json')
  const body = `
{
  "port": 8998
}
`

return { 
  body, 
  to
}
}