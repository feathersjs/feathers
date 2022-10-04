import { generator, toFile, when } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({
  camelName,
  upperName,
  relative,
  type
}: ServiceGeneratorContext) => /* ts */ `import { jsonSchema, resolve } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/schemas/validators'

// Schema for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = {
  $id: '${upperName}Data',
  type: 'object',
  additionalProperties: false,
  required: [ 'text' ],
  properties: {
    text: {
      type: 'string'
    }
  }
} as const

export type ${upperName}Data = FromSchema<typeof ${camelName}DataSchema>

export const ${camelName}DataValidator = jsonSchema.getDataValidator(${camelName}DataSchema, dataValidator)

export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({
  properties: {}
})

// Schema for the data that is being returned
export const ${camelName}Schema = {
  $id: '${upperName}',
  type: 'object',
  additionalProperties: false,
  required: [ ...${camelName}DataSchema.required, '${type === 'mongodb' ? '_id' : 'id'}' ],
  properties: {
    ...${camelName}DataSchema.properties,
    ${type === 'mongodb' ? '_id' : 'id'}: {
      type: '${type === 'mongodb' ? 'string' : 'number'}'
    }
  }
} as const

export type ${upperName} = FromSchema<typeof ${camelName}Schema>

export const ${camelName}Resolver = resolve<${upperName}, HookContext>({
  properties: {}
})

export const ${camelName}ExternalResolver = resolve<${upperName}, HookContext>({
  properties: {}
})

// Schema for allowed query properties
export const ${camelName}QuerySchema = {
  $id: '${upperName}Query',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...jsonSchema.querySyntax(${camelName}Schema.properties)
  }
} as const

export type ${upperName}Query = FromSchema<typeof ${camelName}QuerySchema>

export const ${camelName}QueryValidator = jsonSchema.getValidator(${camelName}QuerySchema, queryValidator)

export const ${camelName}QueryResolver = resolve<${upperName}Query, HookContext>({
  properties: {}
})
`

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    when<ServiceGeneratorContext>(
      ({ schema }) => schema !== false,
      renderSource(
        template,
        toFile(({ lib, folder, fileName }: ServiceGeneratorContext) => [
          lib,
          'services',
          ...folder,
          `${fileName}.schema`
        ])
      )
    )
  )
