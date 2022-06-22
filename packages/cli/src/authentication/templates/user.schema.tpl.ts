import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const template = ({ camelName, upperName, authStrategies, type }: AuthenticationGeneratorContext) =>
  `import { schema, querySyntax } from '@feathersjs/schema'
import type { Infer } from '@feathersjs/schema'
  
// Schema for the basic data model (e.g. creating new entries)
export const ${camelName}DataSchema = schema({
  $id: '${upperName}Data',
  type: 'object',
  additionalProperties: false,
  required: [ ${authStrategies.includes('local') ? "'email', 'password'" : ''} ],
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
} as const)

export type ${upperName}Data = Infer<typeof ${camelName}DataSchema>


// Schema for making partial updates
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

// Schema for the data that is being returned
export const ${camelName}ResultSchema = schema({
  $id: '${upperName}Result',
  type: 'object',
  additionalProperties: false,
  required: [ '${type === 'mongodb' ? '_id' : 'id'}' ],
  properties: {
    ...${camelName}DataSchema.properties,
    ${type === 'mongodb' ? '_id' : 'id'}: {
      type: '${type === 'mongodb' ? 'string' : 'number'}'
    }
  }
} as const)

export type ${upperName}Result = Infer<typeof ${camelName}ResultSchema>

// Queries shouldn't allow doing anything with the password
const { password, ...${camelName}QueryProperties } = ${camelName}ResultSchema.properties

// Schema for allowed query properties
export const ${camelName}QuerySchema = schema({
  $id: '${upperName}Query',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(${camelName}QueryProperties)
  }
} as const)

export type ${upperName}Query = Infer<typeof ${camelName}QuerySchema>
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
