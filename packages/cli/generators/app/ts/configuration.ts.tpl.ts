import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({}: AppGeneratorContext) =>
`import { schema, Infer, Ajv } from '@feathersjs/schema'
import { authenticationSettingsSchema } from '@feathersjs/authentication'

export const configurationSchema = schema({
  $id: 'ApplicationConfiguration',
  type: 'object',
  additionalProperties: false,
  required: [ 'database', 'host', 'port', 'public', 'paginate' ],
  properties: {
    host: { type: 'string' },
    port: { type: 'number' },
    public: { type: 'string' },
    database: { type: 'string' },
    authentication: authenticationSettingsSchema,
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
} as const, new Ajv())

export type ConfigurationSchema = Infer<typeof configurationSchema>
`

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile<AppGeneratorContext>(({ lib }) => lib, 'schemas', 'configuration.schema.ts')))
