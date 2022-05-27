import { strict as assert } from 'assert'
import { feathers, Application } from '@feathersjs/feathers'
import { Ajv, schema } from '@feathersjs/schema'
import configuration from '../src'

describe('@feathersjs/configuration', () => {
  const app: Application = feathers().configure(configuration())

  it('initialized app with default.json', () => {
    assert.equal(app.get('port'), 3030)
    assert.deepEqual(app.get('array'), ['one', 'two', 'three'])
    assert.deepEqual(app.get('deep'), { base: false })
    assert.deepEqual(app.get('nullish'), null)
  })

  it('works when called directly', () => {
    const fn = configuration()
    const conf = fn() as any

    assert.strictEqual(conf.port, 3030)
  })

  it('errors on .setup when a schema is passed and the configuration is invalid', async () => {
    const configurationSchema = schema(
      {
        $id: 'ConfigurationSchema',
        additionalProperties: false,
        type: 'object',
        properties: {
          port: { type: 'number' },
          deep: {
            type: 'object',
            properties: {
              base: {
                type: 'boolean'
              }
            }
          },
          array: {
            type: 'array',
            items: { type: 'string' }
          },
          nullish: {
            type: 'string'
          }
        }
      } as const,
      new Ajv()
    )

    const schemaApp = feathers().configure(configuration(configurationSchema))

    await assert.rejects(() => schemaApp.setup(), {
      data: [
        {
          instancePath: '/nullish',
          keyword: 'type',
          message: 'must be string',
          params: {
            type: 'string'
          },
          schemaPath: '#/properties/nullish/type'
        }
      ]
    })
  })
})
