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
const configurationTemplate =
  ({}: AppGeneratorContext) => /* ts */ `import { schema, Ajv } from '@feathersjs/schema'
import type { Infer } from '@feathersjs/schema'
import { authenticationSettingsSchema } from '@feathersjs/authentication'
import { dataValidator } from './validators'

export const configurationSchema = schema(
  {
    $id: 'ApplicationConfiguration',
    type: 'object',
    additionalProperties: false,
    required: [ 'host', 'port', 'public', 'paginate' ],
    properties: {
      host: { type: 'string' },
      port: { type: 'number' },
      public: { type: 'string' },
      authentication: authenticationSettingsSchema,
      origins: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      paginate: {
        type: 'object',
        additionalProperties: false,
        required: [ 'default', 'max' ],
        properties: {
          default: { type: 'number' },
          max: { type: 'number' }
        }
      }
    }
  } as const,
  dataValidator
)

export type ConfigurationSchema = Infer<typeof configurationSchema>
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        configurationTemplate,
        toFile<AppGeneratorContext>(({ lib }) => lib, 'schemas', 'configuration')
      )
    )
    .then(
      renderSource(
        validatorTemplate,
        toFile<AppGeneratorContext>(({ lib }) => lib, 'schemas', 'validators')
      )
    )
