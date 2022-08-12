import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const template = ({
  camelName,
  upperName,
  relative,
  authStrategies,
  type,
  fileName
}: AuthenticationGeneratorContext) =>
  `import { resolve } from '@feathersjs/schema'
${authStrategies.includes('local') ? `import { passwordHash } from '@feathersjs/authentication-local'` : ''}
import type { HookContext } from '${relative}/declarations'
import type {
  ${upperName}Data,
  ${upperName}Patch,
  ${upperName}Result,
  ${upperName}Query,
} from './${fileName}.schema'
import {
  ${camelName}DataSchema,
  ${camelName}PatchSchema,
  ${camelName}ResultSchema,
  ${camelName}QuerySchema
} from './${fileName}.schema'


// Resolver for the basic data model (e.g. creating new entries)
export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({
  schema: ${camelName}DataSchema,
  validate: 'before',
  properties: {
    ${authStrategies.includes('local') ? `password: passwordHash({ strategy: 'local' })` : ''}
  }
})


// Resolver for making partial updates
export const ${camelName}PatchResolver = resolve<${upperName}Patch, HookContext>({
  schema: ${camelName}PatchSchema,
  validate: 'before',
  properties: {
    ${authStrategies.includes('local') ? `password: passwordHash({ strategy: 'local' })` : ''}
  }
})


// Resolver for the data that is being returned
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


// Resolver for allowed query properties
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
      toFile(({ lib, folder, fileName }: AuthenticationGeneratorContext) => [
        lib,
        'services',
        ...folder,
        `${fileName}.resolver`
      ]),
      { force: true }
    )
  )
