import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const js = ({ camelName, className }: ServiceGeneratorContext) =>
`import { schema, resolve } from '@feathersjs/schema'

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

// Export all resolvers in a format that can be used with the resolveAll hook
export const ${camelName}Resolvers = {
  result: ${camelName}ResultResolver,
  data: ${camelName}DataResolver,
  query: ${camelName}QueryResolver
}
`

const ts = ({ camelName, upperName, relative, type }: ServiceGeneratorContext) =>
`import { schema, resolve, querySyntax, Infer } from '@feathersjs/schema'
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

export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({
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
    ...${camelName}DataSchema.properties
  }
} as const)

export type ${upperName}Patch = Infer<typeof ${camelName}PatchSchema>

export const ${camelName}PatchResolver = resolve<${upperName}Patch, HookContext>({
  schema: ${camelName}PatchSchema,
  validate: 'before',
  properties: {}
})


// Schema and resolver for the data that is being returned
export const ${camelName}ResultSchema = schema({
  $id: '${upperName}Result',
  type: 'object',
  additionalProperties: false,
  required: [ ...${camelName}DataSchema.required, '${type === 'mongodb' ? '_id' : 'id'}' ],
  properties: {
    ...${camelName}DataSchema.definition.properties,
    ${type === 'mongodb' ? '_id' : 'id'}: {
      type: 'string'
    }
  }
} as const)

export type ${upperName}Result = Infer<typeof ${camelName}ResultSchema>

export const ${camelName}ResultResolver = resolve<${upperName}Result, HookContext>({
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
    ...querySyntax(${camelName}ResultSchema.properties)
  }
} as const)

export type ${upperName}Query = Infer<typeof ${camelName}QuerySchema>

export const ${camelName}QueryResolver = resolve<${upperName}Query, HookContext>({
  schema: ${camelName}QuerySchema,
  validate: 'before',
  properties: {}
})

// Export all resolvers in a format that can be used with the resolveAll hook
export const ${camelName}Resolvers = {
  result: ${camelName}ResultResolver,
  data: ${camelName}DataResolver,
  query: ${camelName}QueryResolver
}
`

export const generate = (ctx: ServiceGeneratorContext) => generator(ctx)
  .then(renderSource({ ts, js }, toFile(({ lib, folder, kebabName }: ServiceGeneratorContext) =>
    [lib, 'schemas', ...folder, `${kebabName}.schema`]
  )))
