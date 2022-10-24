import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const validatorTemplate = /* ts */ `import { Ajv, addFormats } from '@feathersjs/schema'
import type { FormatsPluginOptions } from '@feathersjs/schema'

const formats: FormatsPluginOptions = [
  'date-time', 
  'time', 
  'date', 
  'email',  
  'hostname', 
  'ipv4', 
  'ipv6', 
  'uri', 
  'uri-reference', 
  'uuid',
  'uri-template', 
  'json-pointer', 
  'relative-json-pointer', 
  'regex'
]

export const dataValidator = addFormats(new Ajv({}), formats)

export const queryValidator = addFormats(new Ajv({
  coerceTypes: true
}), formats)
`

const configurationJsonTemplate =
  ({}: AppGeneratorContext) => /* ts */ `import { defaultAppSettings, getValidator } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import { dataValidator } from './validators'

export const configurationSchema = {
  type: 'object',
  additionalProperties: false,
  required: [ 'host', 'port', 'public' ],
  properties: {
    ...defaultAppSettings,
    host: { type: 'string' },
    port: { type: 'number' },
    public: { type: 'string' }
  }
} as const

export const configurationValidator = getValidator(configurationSchema, dataValidator)

export type ApplicationConfiguration = FromSchema<typeof configurationSchema>
`

const configurationTypeboxTemplate =
  ({}: AppGeneratorContext) => /* ts */ `import { Type, getValidator, defaultAppConfiguration } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { dataValidator } from './validators'

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String()
  })
])

export type ApplicationConfiguration = Static<typeof configurationSchema>

export const configurationValidator = getValidator(configurationSchema, dataValidator)
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        async (ctx) =>
          ctx.schema === 'typebox' ? configurationTypeboxTemplate(ctx) : configurationJsonTemplate(ctx),
        toFile<AppGeneratorContext>(({ lib }) => lib, 'schemas', 'configuration')
      )
    )
    .then(
      renderSource(
        validatorTemplate,
        toFile<AppGeneratorContext>(({ lib }) => lib, 'schemas', 'validators')
      )
    )
