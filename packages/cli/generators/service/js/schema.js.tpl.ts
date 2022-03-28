import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const template = ({ camelName, className }: ServiceGeneratorContext) =>
`import { schema, resolve } from '@feathersjs/schema';

// Schema and resolver for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = schema({
  $id: '${className}Data',
  type: 'object',
  additionalProperties: false,
  required: [ 'text' ],
  properties: {
    text: {
      type: 'string'
    }
  }
})

export const ${camelName}DataResolver = resolve({
  schema: ${camelName}DataSchema,
  validate: 'before',
  properties: {}
})


// Schema and resolver for making partial updates
export const ${camelName}PatchSchema = schema({
  $id: '${className}Patch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...${camelName}DataSchema.definition.properties
  }
})

export const ${camelName}PatchResolver = resolve({
  schema: ${camelName}PatchSchema,
  validate: 'before',
  properties: {}
})


// Schema and resolver for the data that is being returned
export const ${camelName}ResultSchema = schema({
  $id: '${className}Result',
  type: 'object',
  additionalProperties: false,
  required: [ 'text', 'id' ],
  properties: {
    ...${camelName}DataSchema.definition.properties,
    id: {
      type: 'string'
    }
  }
})

export const ${camelName}ResultResolver = resolve({
  schema: ${camelName}ResultSchema,
  validate: false,
  properties: {}
})


// Schema and resolver for allowed query properties
export const ${camelName}QuerySchema = schema({
  $id: '${camelName}Query',
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
})

export const ${camelName}QueryResolver = resolve({
  schema: ${camelName}QuerySchema,
  validate: 'before',
  properties: {}
})
`

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile(({ lib, folder, kebabName }: ServiceGeneratorContext) =>
    [lib, 'schemas', ...folder, `${kebabName}.schema.js`]
  )))
