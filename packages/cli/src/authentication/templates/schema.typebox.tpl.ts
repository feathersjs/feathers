import { generator, toFile, when } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AuthenticationGeneratorContext, localTemplate } from '../index'

export const template = ({
  camelName,
  upperName,
  authStrategies,
  type,
  relative
}: AuthenticationGeneratorContext) => /* ts */ `import { resolve } from '@feathersjs/schema'
import { Type, getDataValidator, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
${localTemplate(authStrategies, `import { passwordHash } from '@feathersjs/authentication-local'`)}

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/schemas/validators'

// Main data model schema
export const ${camelName}Schema = Type.Object({
  ${type === 'mongodb' ? '_id: Type.String()' : 'id: Type.Number()'},
  ${authStrategies
    .map((name) =>
      name === 'local'
        ? `  email: Type.String(),
  password: Type.Optional(Type.String())`
        : `    ${name}Id: Type.Optional(Type.String())`
    )
    .join(',\n')}
},{ $id: '${upperName}', additionalProperties: false })
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

// Schema for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = Type.Pick(${camelName}Schema, [
  ${authStrategies.map((name) => (name === 'local' ? `'email', 'password'` : `'${name}Id'`)).join(', ')}
],
  { $id: '${upperName}Data', additionalProperties: false }
)
export type ${upperName}Data = Static<typeof ${camelName}DataSchema>
export const ${camelName}DataValidator = getDataValidator(${camelName}DataSchema, dataValidator)
export const ${camelName}DataResolver = resolve<${upperName}, HookContext>({
  properties: {
    ${localTemplate(authStrategies, `password: passwordHash({ strategy: 'local' })`)}
  }
})

// Schema for allowed query properties
export const ${camelName}QueryProperties = Type.Pick(${camelName}Schema, ['${
  type === 'mongodb' ? '_id' : 'id'
}', ${authStrategies.map((name) => (name === 'local' ? `'email'` : `'${name}Id'`)).join(', ')}
])
export const ${camelName}QuerySchema = querySyntax(${camelName}QueryProperties)
export type ${upperName}Query = Static<typeof ${camelName}QuerySchema>
export const ${camelName}QueryValidator = getValidator(${camelName}QuerySchema, queryValidator)
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
