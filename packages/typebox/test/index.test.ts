import assert from 'assert'
import { Ajv } from '@feathersjs/schema'
import {
  querySyntax,
  Type,
  Static,
  defaultAppConfiguration,
  getDataValidator,
  getValidator,
  queryProperties
} from '../src'

describe('@feathersjs/schema/typebox', () => {
  describe('querySyntax', () => {
    it('basics', async () => {
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
      let validated = (await validator(query)) as any as Query

      assert.ok(validated)

      validated = (await validator({ ...query, something: 'wrong' })) as any as Query
      assert.ok(!validated)
    })

    it('queryProperties errors for unsupported query types', () => {
      assert.throws(
        () =>
          queryProperties(
            Type.Object({
              something: Type.Object({})
            })
          ),
        {
          message:
            "Can not create query syntax schema for property 'something'. Only types string, number, integer, boolean, null are allowed."
        }
      )

      assert.throws(
        () =>
          queryProperties(
            Type.Object({
              otherThing: Type.Array(Type.String())
            })
          ),
        {
          message:
            "Can not create query syntax schema for property 'otherThing'. Only types string, number, integer, boolean, null are allowed."
        }
      )
    })

    it('querySyntax works with no properties', async () => {
      const schema = querySyntax(Type.Object({}))

      new Ajv().compile(schema)
    })
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
