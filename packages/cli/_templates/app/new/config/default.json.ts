import { join } from 'path'
import { VariablesApp } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesApp>): RenderResult {
  const to = join(context.lib, 'config', 'default.json')
  const body = `
{
  "host": "localhost",
  "port": 3030,
  "public": "./public/",
  "paginate": {
    "default": 10,
    "max": 50
  }
}
`

  return { 
    body, 
    to
  }
}