import { generator, toFile, when } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

export const template = ({
  camelName,
  upperName,
  authStrategies,
  type,
  relative
}: AuthenticationGeneratorContext) => /* ts */ `import { jsonSchema, resolve } from '@feathersjs/schema'
import { Type, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
${authStrategies.includes('local') ? `import { passwordHash } from '@feathersjs/authentication-local'` : ''}

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/schemas/validators'

// Schema for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = Type.Object({
  ${authStrategies
    .map((name) =>
      name === 'local'
        ? `  email: Type.String(),
  password: Type.String()`
        : `    ${name}Id: Type.Optional(Type.String())`
    )
    .join(',\n')}
}, { $id: '${upperName}Data', additionalProperties: false })

export type ${upperName}Data = Static<typeof ${camelName}DataSchema>

export const ${camelName}DataValidator = jsonSchema.getDataValidator(${camelName}DataSchema, dataValidator)

export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({
  properties: {
    ${authStrategies.includes('local') ? `password: passwordHash({ strategy: 'local' })` : ''}
  }
})

// Schema for the data that is being returned
export const ${camelName}Schema = Type.Intersect([
  ${camelName}DataSchema, 
  Type.Object({
    ${type === 'mongodb' ? '_id: Type.String()' : 'id: Type.Number()'}
  })
], { $id: '${upperName}' })

export type ${upperName} = Static<typeof ${camelName}Schema>

export const ${camelName}Resolver = resolve<${upperName}, HookContext>({
  properties: {}
})

export const ${camelName}ExternalResolver = resolve<${upperName}, HookContext>({
  properties: {
    // The password should never be visible externally
    password: async () => undefined
  }
})

// Schema for allowed query properties
export const ${camelName}QuerySchema = Type.Intersect([
  querySyntax(${camelName}Schema),
  // Add additional query properties here
  Type.Object({})
])

export type ${upperName}Query = Static<typeof ${camelName}QuerySchema>

export const ${camelName}QueryValidator = jsonSchema.getValidator(${camelName}QuerySchema, queryValidator)

export const ${camelName}QueryResolver = resolve<${upperName}Query, HookContext>({
  properties: {
    // If there is a user (e.g. with authentication), they are only allowed to see their own data
    ${type === 'mongodb' ? '_id' : 'id'}: async (value, user, context) => {
      if (context.params.user) {
        return context.params.user.${type === 'mongodb' ? '_id' : 'id'}
      }
  
      return value
    }
  }
})
`

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx).then(
    when<AuthenticationGeneratorContext>(
      ({ schema }) => schema === 'typebox',
      renderSource(
        template,
        toFile(({ lib, folder, fileName }: AuthenticationGeneratorContext) => [
          lib,
          'services',
          ...folder,
          `${fileName}.schema`
        ]),
        { force: true }
      )
    )
  )
