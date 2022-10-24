import assert from 'assert'
import { Ajv } from '@feathersjs/schema'
import { querySyntax, Type, Static, defaultAppConfiguration, getDataValidator, getValidator } from '../src'

describe('@feathersjs/schema/typebox', () => {
  it('querySyntax', async () => {
    const schema = Type.Object({
      name: Type.String(),
      age: Type.Number()
    })

    const querySchema = querySyntax(schema)

    type Query = Static<typeof querySchema>

    const query: Query = {
      name: 'Dave',
      age: { $gt: 42, $in: [50, 51] },
      $select: ['age', 'name'],
      $sort: {
        age: 1
      }
    }

    const validator = new Ajv().compile(querySchema)
    const validated = (await validator(query)) as any as Query

    assert.ok(validated)
  })

  it('defaultAppConfiguration', async () => {
    const configSchema = Type.Intersect([
      defaultAppConfiguration,
      Type.Object({
        host: Type.String(),
        port: Type.Number(),
        public: Type.String()
      })
    ])

    const validator = new Ajv().compile(configSchema)
    const validated = await validator({
      host: 'something',
      port: 3030,
      public: './'
    })

    assert.ok(validated)
  })

  it('validators', () => {
    assert.strictEqual(typeof getDataValidator(Type.Object({}), new Ajv()), 'object')
    assert.strictEqual(typeof getValidator(Type.Object({}), new Ajv()), 'function')
  })
})
