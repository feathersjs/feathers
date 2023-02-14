import assert from 'assert'
import { ObjectId as MongoObjectId } from 'mongodb'
import { Ajv } from '@feathersjs/schema'
import {
  querySyntax,
  Type,
  Static,
  defaultAppConfiguration,
  getDataValidator,
  getValidator,
  ObjectIdSchema
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

  // Test ObjectId validation
  it('ObjectId', async () => {
    const schema = Type.Object({
      _id: ObjectIdSchema()
    })

    const validator = new Ajv({
      strict: false
    }).compile(schema)
    const validated = await validator({
      _id: '507f191e810c19729de860ea'
    })
    assert.ok(validated)

    const validated2 = await validator({
      _id: new MongoObjectId()
    })
    assert.ok(validated2)
  })

  it('validators', () => {
    assert.strictEqual(typeof getDataValidator(Type.Object({}), new Ajv()), 'object')
    assert.strictEqual(typeof getValidator(Type.Object({}), new Ajv()), 'function')
  })
})
