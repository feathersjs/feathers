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
}: ServiceGeneratorContext) => /* ts */ `// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getDataValidator, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/${
  fileExists(cwd, lib, 'schemas') ? 'schemas/' : '' // This is for legacy backwards compatibility
}validators'

// Main data model schema
export const ${camelName}Schema = Type.Object({
    ${type === 'mongodb' ? '_id: Type.String()' : 'id: Type.Number()'},
    text: Type.String()
  }, { $id: '${upperName}', additionalProperties: false })
export type ${upperName} = Static<typeof ${camelName}Schema>
export const ${camelName}Resolver = resolve<${upperName}, HookContext>({})

export const ${camelName}ExternalResolver = resolve<${upperName}, HookContext>({})

// Schema for creating new entries
export const ${camelName}DataSchema = Type.Pick(${camelName}Schema, ['text'], {
  $id: '${upperName}Data', additionalProperties: false
})
export type ${upperName}Data = Static<typeof ${camelName}DataSchema>
export const ${camelName}DataValidator = getDataValidator(${camelName}DataSchema, dataValidator)
export const ${camelName}DataResolver = resolve<${upperName}, HookContext>({})

// Schema for allowed query properties
export const ${camelName}QueryProperties = Type.Pick(${camelName}Schema, [
  '${type === 'mongodb' ? '_id' : 'id'}', 'text'
], { additionalProperties: false })
export const ${camelName}QuerySchema = querySyntax(${camelName}QueryProperties)
export type ${upperName}Query = Static<typeof ${camelName}QuerySchema>
export const ${camelName}QueryValidator = getValidator(${camelName}QuerySchema, queryValidator)
export const ${camelName}QueryResolver = resolve<${upperName}Query, HookContext>({})
`

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    when<ServiceGeneratorContext>(
      ({ schema }) => schema === 'typebox',
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
