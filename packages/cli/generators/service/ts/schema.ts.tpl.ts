import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const template = ({ camelName, className, upperName, relative }: ServiceGeneratorContext) =>
`import { schema, resolve, Infer } from '@feathersjs/schema'
import { HookContext } from '${relative}/declarations'

// Schema and resolver for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = schema({
  $id: '${upperName}Data',
  type: 'object',
  additionalProperties: false,
  required: [ 'text' ],
  properties: {
    text: {
      type: 'string'
    }
  }
} as const)

export type ${upperName}Data = Infer<typeof ${camelName}DataSchema>

export const ${camelName}DataResolver = resolve<${className}Data, HookContext>({
  schema: ${camelName}DataSchema,
  validate: 'before',
  properties: {}
})


// Schema and resolver for making partial updates
export const ${camelName}PatchSchema = schema({
  $id: '${upperName}Patch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...${camelName}DataSchema.definition.properties
  }
} as const)

export type ${upperName}Patch = Infer<typeof ${camelName}PatchSchema>

export const ${camelName}PatchResolver = resolve<${className}Patch, HookContext>({
  schema: ${camelName}PatchSchema,
  validate: 'before',
  properties: {}
})


// Schema and resolver for the data that is being returned
export const ${camelName}ResultSchema = schema({
  $id: '${upperName}Result',
  type: 'object',
  additionalProperties: false,
  required: [ 'text', 'id' ],
  properties: {
    ...${camelName}DataSchema.definition.properties,
    id: {
      type: 'string'
    }
  }
} as const)

export type ${upperName}Result = Infer<typeof ${camelName}ResultSchema>

export const ${camelName}ResultResolver = resolve<${className}Result, HookContext>({
  schema: ${camelName}ResultSchema,
  validate: false,
  properties: {}
})


// Schema and resolver for allowed query properties
export const ${camelName}QuerySchema = schema({
  $id: '${upperName}Query',
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
} as const)

export type ${upperName}Query = Infer<typeof ${camelName}QuerySchema>

export const ${camelName}QueryResolver = resolve<${className}Query, HookContext>({
  schema: ${camelName}QuerySchema,
  validate: 'before',
  properties: {}
})
`

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile(({ lib, folder, kebabName }: ServiceGeneratorContext) =>
    [lib, 'schemas', ...folder, `${kebabName}.schema.ts`]
  )))
