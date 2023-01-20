import { generator, toFile, when } from '@feathershq/pinion'
import { fileExists, renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({
  camelName,
  upperName,
  relative,
  type,
  cwd,
  lib
}: ServiceGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/${
  fileExists(cwd, lib, 'schemas') ? 'schemas/' : '' // This is for legacy backwards compatibility
}validators'

// Main data model schema
export const ${camelName}Schema = {
  $id: '${upperName}',
  type: 'object',
  additionalProperties: false,
  required: [ '${type === 'mongodb' ? '_id' : 'id'}', 'text' ],
  properties: {
    ${type === 'mongodb' ? '_id' : 'id'}: {
      type: '${type === 'mongodb' ? 'string' : 'number'}'
    },
    text: {
      type: 'string'
    }
  }
} as const
export type ${upperName} = FromSchema<typeof ${camelName}Schema>
export const ${camelName}Validator = getValidator(${camelName}Schema, dataValidator)
export const ${camelName}Resolver = resolve<${upperName}, HookContext>({})

export const ${camelName}ExternalResolver = resolve<${upperName}, HookContext>({})

// Schema for creating new data
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
export const ${camelName}DataValidator = getValidator(${camelName}DataSchema, dataValidator)
export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({})

// Schema for updating existing data
export const ${camelName}PatchSchema = {
  $id: '${upperName}Patch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...${camelName}Schema.properties
  }
} as const
export type ${upperName}Patch = FromSchema<typeof ${camelName}PatchSchema>
export const ${camelName}PatchValidator = getValidator(${camelName}PatchSchema, dataValidator)
export const ${camelName}PatchResolver = resolve<${upperName}Patch, HookContext>({})

// Schema for allowed query properties
export const ${camelName}QuerySchema = {
  $id: '${upperName}Query',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(${camelName}Schema.properties)
  }
} as const
export type ${upperName}Query = FromSchema<typeof ${camelName}QuerySchema>
export const ${camelName}QueryValidator = getValidator(${camelName}QuerySchema, queryValidator)
export const ${camelName}QueryResolver = resolve<${upperName}Query, HookContext>({})
`

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    when<ServiceGeneratorContext>(
      ({ schema }) => schema === 'json',
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
