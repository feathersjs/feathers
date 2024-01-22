import { toFile, when } from '@featherscloud/pinion'
import { fileExists, localTemplate, renderSource } from '../../commons.js'
import { ServiceGeneratorContext } from '../index.js'

const authFieldsTemplate = (authStrategies: string[]) =>
  authStrategies
    .map((name) =>
      name === 'local'
        ? `    email: { type: 'string' },
    password: { type: 'string' }`
        : `    ${name}Id: { type: 'string' }`
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
}: ServiceGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'${
  type === 'mongodb'
    ? `
import { ObjectIdSchema } from '@feathersjs/schema'`
    : ''
}
import type { FromSchema } from '@feathersjs/schema'
${localTemplate(authStrategies, `import { passwordHash } from '@feathersjs/authentication-local'`)}

import type { HookContext } from '${relative}/declarations'
import { dataValidator, queryValidator } from '${relative}/${
  fileExists(cwd, lib, 'schemas') ? 'schemas/' : '' // This is for legacy backwards compatibility
}validators'
import type { ${upperName}Service } from './${fileName}.class'

// Main data model schema
export const ${camelName}Schema = {
  $id: '${upperName}',
  type: 'object',
  additionalProperties: false,
  required: [ '${type === 'mongodb' ? '_id' : 'id'}', ${localTemplate(authStrategies, `'email'`, `'text'`)} ],
  properties: {
    ${type === 'mongodb' ? `_id: ObjectIdSchema(),` : `id: { type: 'number' },`}
    ${
      isEntityService
        ? authFieldsTemplate(authStrategies)
        : `
    text: { type: 'string' }`
    }
  }
} as const
export type ${upperName} = FromSchema<typeof ${camelName}Schema>
export const ${camelName}Validator = getValidator(${camelName}Schema, dataValidator)
export const ${camelName}Resolver = resolve<${upperName}, HookContext<${upperName}Service>>({})

export const ${camelName}ExternalResolver = resolve<${upperName}, HookContext<${upperName}Service>>({
  ${localTemplate(
    authStrategies,
    `// The password should never be visible externally
  password: async () => undefined`
  )}
})

// Schema for creating new data
export const ${camelName}DataSchema = {
  $id: '${upperName}Data',
  type: 'object',
  additionalProperties: false,
  required: [ ${localTemplate(authStrategies, `'email'`, `'text'`)} ],
  properties: {
    ...${camelName}Schema.properties
  }
} as const
export type ${upperName}Data = FromSchema<typeof ${camelName}DataSchema>
export const ${camelName}DataValidator = getValidator(${camelName}DataSchema, dataValidator)
export const ${camelName}DataResolver = resolve<${upperName}Data, HookContext<${upperName}Service>>({
  ${localTemplate(authStrategies, `password: passwordHash({ strategy: 'local' })`)}
})

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
export const ${camelName}PatchResolver = resolve<${upperName}Patch, HookContext<${upperName}Service>>({
  ${localTemplate(authStrategies, `password: passwordHash({ strategy: 'local' })`)}
})

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
