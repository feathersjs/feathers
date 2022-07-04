import { feathers } from '@feathersjs/feathers'
import { schema, Infer } from '@feathersjs/schema'
import configuration from '@feathersjs/configuration'

const configurationSchema = schema({
  $id: 'FeathersConfiguration',
  type: 'object',
  additionalProperties: false,
  required: ['port', 'host'],
  properties: {
    port: { type: 'number' },
    host: { type: 'string' }
  }
} as const)

type ServiceTypes = {}
// Use the schema type for typed `app.get` and `app.set` calls
type Configuration = Infer<typeof configurationSchema>

// Use the application root and `config/` as the configuration folder
const app = feathers<ServiceTypes, Configuration>().configure(
  configuration(configurationSchema)
)

// Configuration will only be validated now
app
  .listen()
  .then(() => console.log('Server started'))
  .catch((error) => {
    // Configuration validation errors will show up here
  })
