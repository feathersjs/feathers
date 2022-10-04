import { generator, toFile, when } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({
  camelName,
  upperName,
  relative,
  type
}: ServiceGeneratorContext) => /* ts */ `import { Type, jsonSchema, typebox, resolve } from '@feathersjs/schema'
import type { Static } from '@feathersjs/schema'

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/schemas/validators'

// Schema for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = Type.Object({
  text: Type.String()
}, { $id: '${upperName}Data', additionalProperties: false })

export type ${upperName}Data = Static<typeof ${camelName}DataSchema>

export const ${camelName}DataValidator = jsonSchema.getDataValidator(${camelName}DataSchema, dataValidator)

export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({
  properties: {}
})

export const ${camelName}Schema = Type.Intersect([
  ${camelName}DataSchema, 
  Type.Object({
    ${type === 'mongodb' ? '_id: Type.String()' : 'id: Type.Number()'}
  })
], { $id: '${upperName}', additionalProperties: false })

export type ${upperName} = Static<typeof ${camelName}Schema>

export const ${camelName}Resolver = resolve<${upperName}, HookContext>({
  properties: {}
})

export const ${camelName}ExternalResolver = resolve<${upperName}, HookContext>({
  properties: {}
})

// Schema for allowed query properties
export const ${camelName}QuerySchema = Type.Intersect([
  typebox.querySyntax(${camelName}Schema),
  // Add additional query properties here
  Type.Object({})
])

export type ${upperName}Query = Static<typeof ${camelName}QuerySchema>

export const ${camelName}QueryValidator = jsonSchema.getValidator(${camelName}QuerySchema, queryValidator)

export const ${camelName}QueryResolver = resolve<${upperName}Query, HookContext>({
  properties: {}
})
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
