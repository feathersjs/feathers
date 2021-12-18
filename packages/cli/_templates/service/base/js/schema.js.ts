import { join } from 'path'
import { VariablesService } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.lib, 'schema', `${context.path}.schema.js`)
  const body = `
import { schema, resolve } from '@feathersjs/schema';

export const ${context.camelName}DataSchema = schema({
  $id: '${context.camelName}Data',
  type: 'object',
  additionalProperties: false,
  required: [ 'text' ],
  properties: {
    text: {
      type: 'string'
    }
  }
});

export const ${context.camelName}ResultSchema = ${context.camelName}DataSchema.extend({
  $id: '${context.camelName}Result'
})

export const ${context.camelName}QuerySchema = schema({
  $id: '${context.camelName}Query',
  type: 'object',
  additionalProperties: false,
  properties: {
    $limit: {
      type: 'integer',
      minimum: 0,
      maximum: 100
    },
    $skip: {
      type: 'integer',
      minimum: 0
    }
  }
});

export const ${context.camelName}QueryResolver = resolve({
  schema: ${context.camelName}QuerySchema,
  validate: 'before',
  properties: {}
});

export const ${context.camelName}DataResolver = resolve({
  schema: ${context.camelName}DataSchema,
  validate: 'before',
  properties: {}
});

export const ${context.camelName}ResultResolver = resolve({
  schema: ${context.camelName}ResultSchema,
  validate: false,
  properties: {}
});
`

  return { 
    body, 
    to
  }
}