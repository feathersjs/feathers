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
              something: Type.Ref(Type.Object({}, { $id: 'something' }))
            })
          ),
        {
          message: "Can not create query syntax schema for reference property 'something'"
        }
      )
    })

    it('querySyntax works with no properties', async () => {
      const schema = querySyntax(Type.Object({}))

      new Ajv().compile(schema)
    })

    it('query syntax can include additional extensions', async () => {
      const schema = Type.Object({
        name: Type.String(),
        age: Type.Number()
      })
      const querySchema = querySyntax(schema, {
        age: {
          $notNull: Type.Boolean()
        },
        name: {
          $ilike: Type.String()
        }
      })
      const validator = new Ajv().compile(querySchema)

      type Query = Static<typeof querySchema>

      const query: Query = {
        age: {
          $gt: 10,
          $notNull: true
        },
        name: {
          $gt: 'David',
          $ilike: 'Dave'
        }
      }

      const validated = (await validator(query)) as any as Query

      assert.ok(validated)
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
