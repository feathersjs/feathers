import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const template = ({ camelName, upperName, relative, schemaPath }: ServiceGeneratorContext) =>
  `import { resolve } from '@feathersjs/schema'
import { HookContext } from '${relative}/declarations'

import {
  ${upperName}Data,
  ${upperName}Patch,
  ${upperName}Result,
  ${upperName}Query,
  ${camelName}DataSchema,
  ${camelName}PatchSchema,
  ${camelName}ResultSchema,
  ${camelName}QuerySchema
} from '../${schemaPath}'


// Resolver for the basic data model (e.g. creating new entries)
export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext>({
  schema: ${camelName}DataSchema,
  validate: 'before',
  properties: {}
})


// Resolver for making partial updates
export const ${camelName}PatchResolver = resolve<${upperName}Patch, HookContext>({
  schema: ${camelName}PatchSchema,
  validate: 'before',
  properties: {}
})


// Resolver for the data that is being returned
export const ${camelName}ResultResolver = resolve<${upperName}Result, HookContext>({
  schema: ${camelName}ResultSchema,
  validate: false,
  properties: {}
})


// Resolver for query properties
export const ${camelName}QueryResolver = resolve<${upperName}Query, HookContext>({
  schema: ${camelName}QuerySchema,
  validate: 'before',
  properties: {}
})


// Export all resolvers in a format that can be used with the resolveAll hook
export const ${camelName}Resolvers = {
  result: ${camelName}ResultResolver,
  data: {
    create: ${camelName}DataResolver,
    update: ${camelName}DataResolver,
    patch: ${camelName}PatchResolver
  },
  query: ${camelName}QueryResolver
}
`

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile(({ lib, folder, kebabName }: ServiceGeneratorContext) => [
        lib,
        'resolvers',
        ...folder,
        `${kebabName}.resolver`
      ])
    )
  )
