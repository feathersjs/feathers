import { join } from 'path'
import { VariablesAppBase } from '../..';
import { GeneratorContext, RenderResult } from '../../../../../src';

export function render (context: GeneratorContext<VariablesAppBase>): RenderResult {
  const to = join(context.h.lib, 'services', 'index.js')
  const body = `
export default app => {
}
`

  return { 
    body, 
    to
  }
}