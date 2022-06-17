import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({ camelName, upperName, type }: ServiceGeneratorContext) =>
  `import { schema, querySyntax } from '@feathersjs/schema'
import type { Infer } from '@feathersjs/schema'

// Schema for the basic data model (e.g. creating new entries)
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


// Schema for making partial updates
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


// Schema for the data that is being returned
export const ${camelName}ResultSchema = schema({
  $id: '${upperName}Result',
  type: 'object',
  additionalProperties: false,
  required: [ ...${camelName}DataSchema.required, '${type === 'mongodb' ? '_id' : 'id'}' ],
  properties: {
    ...${camelName}DataSchema.properties,
    ${type === 'mongodb' ? '_id' : 'id'}: {
      type: 'string'
    }
  }
} as const)

export type ${upperName}Result = Infer<typeof ${camelName}ResultSchema>


// Schema for allowed query properties
export const ${camelName}QuerySchema = schema({
  $id: '${upperName}Query',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(${camelName}ResultSchema.properties)
  }
} as const)

export type ${upperName}Query = Infer<typeof ${camelName}QuerySchema>
`

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile(({ lib, folder, kebabName }: ServiceGeneratorContext) => [
        lib,
        'schemas',
        ...folder,
        `${kebabName}.schema`
      ])
    )
  )
