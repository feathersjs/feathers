import { toFile, when } from '@featherscloud/pinion'
import { fileExists, localTemplate, renderSource } from '../../commons.js'
import { ServiceGeneratorContext } from '../index.js'

const authFieldsTemplate = (authStrategies: string[]) =>
  authStrategies
    .map((name) =>
      name === 'local'
        ? `  email: Type.String(),
  password: Type.Optional(Type.String())`
        : `  ${name}Id: Type.Optional(Type.String())`
    )
    .join(',\n')

const template = ({
  camelName,
  upperName,
  fileName,
  relative,
  authStrategies,
  isEntityService,
  type,
  cwd,
  lib
}: ServiceGeneratorContext) => /* ts */ `// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'${
  type === 'mongodb'
    ? `
import { ObjectIdSchema } from '@feathersjs/typebox'`
    : ''
}
import type { Static } from '@feathersjs/typebox'
${localTemplate(authStrategies, `import { passwordHash } from '@feathersjs/authentication-local'`)}

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/${
  fileExists(cwd, lib, 'schemas') ? 'schemas/' : '' // This is for legacy backwards compatibility
}validators'
import type { ${upperName}Service } from './${fileName}.class'

// Main data model schema
export const ${camelName}Schema = Type.Object({
    ${type === 'mongodb' ? '_id: ObjectIdSchema()' : 'id: Type.Number()'},
    ${isEntityService ? authFieldsTemplate(authStrategies) : `text: Type.String()`}
  }, { $id: '${upperName}', additionalProperties: false })
export type ${upperName} = Static<typeof ${camelName}Schema>
export const ${camelName}Validator = getValidator(${camelName}Schema, dataValidator)
export const ${camelName}Resolver = resolve<${upperName}, HookContext<${upperName}Service>>({})

export const ${camelName}ExternalResolver = resolve<${upperName}, HookContext<${upperName}Service>>({
  ${localTemplate(
    authStrategies,
    `// The password should never be visible externally
  password: async () => undefined`
  )}  
})

// Schema for creating new entries
export const ${camelName}DataSchema = Type.Pick(${camelName}Schema, [
  ${
    isEntityService
      ? authStrategies.map((name) => (name === 'local' ? `'email', 'password'` : `'${name}Id'`)).join(', ')
      : `'text'`
  }
], {
  $id: '${upperName}Data'
})
export type ${upperName}Data = Static<typeof ${camelName}DataSchema>
export const ${camelName}DataValidator = getValidator(${camelName}DataSchema, dataValidator)
export const ${camelName}DataResolver = resolve<${upperName}, HookContext<${upperName}Service>>({
  ${localTemplate(authStrategies, `password: passwordHash({ strategy: 'local' })`)}
})

// Schema for updating existing entries
export const ${camelName}PatchSchema = Type.Partial(${camelName}Schema, {
  $id: '${upperName}Patch'
})
export type ${upperName}Patch = Static<typeof ${camelName}PatchSchema>
export const ${camelName}PatchValidator = getValidator(${camelName}PatchSchema, dataValidator)
export const ${camelName}PatchResolver = resolve<${upperName}, HookContext<${upperName}Service>>({
  ${localTemplate(authStrategies, `password: passwordHash({ strategy: 'local' })`)}
})

// Schema for allowed query properties
export const ${camelName}QueryProperties = Type.Pick(${camelName}Schema, [
  '${type === 'mongodb' ? '_id' : 'id'}', ${
    isEntityService
      ? authStrategies.map((name) => (name === 'local' ? `'email'` : `'${name}Id'`)).join(', ')
      : `'text'`
  }
])
export const ${camelName}QuerySchema = Type.Intersect([
  querySyntax(${camelName}QueryProperties),
  // Add additional query properties here
  Type.Object({}, { additionalProperties: false })
], { additionalProperties: false })
export type ${upperName}Query = Static<typeof ${camelName}QuerySchema>
export const ${camelName}QueryValidator = getValidator(${camelName}QuerySchema, queryValidator)
export const ${camelName}QueryResolver = resolve<${upperName}Query, HookContext<${upperName}Service>>({
  ${
    isEntityService
      ? `
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  ${type === 'mongodb' ? '_id' : 'id'}: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user.${type === 'mongodb' ? '_id' : 'id'}
    }

    return value
  }`
      : ''
  }
})
`

export const generate = (ctx: ServiceGeneratorContext) =>
  Promise.resolve(ctx).then(
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
