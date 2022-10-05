import { generator, toFile, when } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const template = ({
  camelName,
  upperName,
  authStrategies,
  type,
  relative
}: AuthenticationGeneratorContext) => /* ts */ `import { resolve, jsonSchema } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'
${authStrategies.includes('local') ? `import { passwordHash } from '@feathersjs/authentication-local'` : ''}

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/schemas/validators'

// Schema for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = {
  $id: '${upperName}Data',
  type: 'object',
  additionalProperties: false,
  required: [ ${authStrategies.includes('local') ? "'email'" : ''} ],
  properties: {
    ${authStrategies
      .map((name) =>
        name === 'local'
          ? `    email: { type: 'string' },
    password: { type: 'string' }`
          : `    ${name}Id: { type: 'string' }`
      )
      .join(',\n')}
  }
} as const
export type ${upperName}Data = FromSchema<typeof ${camelName}DataSchema>
export const ${camelName}DataValidator = jsonSchema.getDataValidator(${camelName}DataSchema, dataValidator)
export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({
  properties: {
    ${authStrategies.includes('local') ? `password: passwordHash({ strategy: 'local' })` : ''}
  }
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
  properties: {
    // The password should never be visible externally
    password: async () => undefined
  }
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
      ({ schema }) => schema === 'json',
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
