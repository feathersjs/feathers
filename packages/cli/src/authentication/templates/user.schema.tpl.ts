import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const template = ({ camelName, upperName, relative, authStrategies, type }: AuthenticationGeneratorContext) =>
  `import { schema, resolve, querySyntax, Infer } from '@feathersjs/schema'
${
  authStrategies.includes('local')
    ? `import { LocalStrategy, passwordHash } from '@feathersjs/authentication-local'`
    : ''
}
import { HookContext } from '${relative}/declarations'

// Schema and resolver for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = schema({
  $id: '${upperName}Data',
  type: 'object',
  additionalProperties: false,
  required: [ ${authStrategies.includes('local') ? "'email', 'password'" : ''} ],
  properties: {
    ${authStrategies
      .map((name) =>
        name === 'local'
          ? `email: {
      type: 'string'
    },
    password: {
      type: 'string'
    }`
          : `${name}Id: {
      type: 'string'
    }`
      )
      .join(',\n')}
  }
} as const)

export type ${upperName}Data = Infer<typeof ${camelName}DataSchema>

export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({
  schema: ${camelName}DataSchema,
  validate: 'before',
  properties: {
    ${
      authStrategies.includes('local')
        ? `password: passwordHash({
          strategy: 'local'
        })`
        : ''
    }    
  }
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
    ...${camelName}DataSchema.properties,
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


// Resolver for the "safe" version that external clients are allowed to see
export const ${camelName}DispatchResolver = resolve<${upperName}Result, HookContext>({
  schema: ${camelName}ResultSchema,
  validate: false,
  properties: {
    // The password should never be visible externally
    password: async () => undefined
  }  
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


// Export all resolvers in a format that can be used with the resolveAll hook
export const ${camelName}Resolvers = {
  result: ${camelName}ResultResolver,
  dispatch: ${camelName}DispatchResolver,
  data: {
    create: ${camelName}DataResolver,
    update: ${camelName}DataResolver,
    patch: ${camelName}PatchResolver
  },
  query: ${camelName}QueryResolver
}
`

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile(({ lib, folder, kebabName }: AuthenticationGeneratorContext) => [
        lib,
        'schemas',
        ...folder,
        `${kebabName}.schema`
      ]),
      { force: true }
    )
  )
