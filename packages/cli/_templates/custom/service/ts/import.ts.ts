import { join } from 'path'
import { GeneratorContext, RenderResult } from '../../../../src'
import { VariablesService } from '../../../service/base'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.lib, 'services', `${context.path}.ts`)
  const body = `
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '${context.relative}/declarations';
`

  return { 
    body, 
    to,
    inject: true,
    prepend: true
  }
}