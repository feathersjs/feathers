import assert from 'assert'
import { ObjectId as MongoObjectId } from 'mongodb'
import { keywordObjectId } from '@feathersjs/mongodb'
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

    it('can extend common operators people typically add', async () => {
      const ajv = new Ajv({ strict: false })
      ajv.addKeyword(keywordObjectId)

      const querySchema = querySyntax(
        Type.Object(
          {
            _id: Type.Union([ObjectIdSchema(), Type.Null()]),
            name: Type.String()
          },
          { additionalProperties: false }
        ),
        {
          name: {
            $regex: Type.String(),
            $options: Type.String(),
            $like: Type.String(),
            $exists: Type.Boolean()
          }
        }
      )
      const validator = ajv.compile(querySchema)

      assert.equal(validator({ name: { $regex: 'Dav', $options: 'i' } }), true)
      assert.equal(validator({ name: { $like: 'D%' } }), true)
      assert.equal(validator({ name: { $exists: true } }), true)
      assert.equal(validator({ _id: null }), true)
      assert.equal(validator({ _id: { $ne: null } }), true)
      assert.equal(validator({ name: { $where: '1==1' } }), false)
    })
  })

  it('$in and $nin works with array type', async () => {
    const schema = Type.Object({
      things: Type.Array(Type.Number())
    })
    const querySchema = querySyntax(schema)
    const validator = new Ajv().compile(querySchema)

    type Query = Static<typeof querySchema>

    const query: Query = {
      things: {
        $in: [10, 20],
        $nin: [30]
      }
    }

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

  it('ObjectIdSchema rejects operator objects when the objectid keyword is registered', async () => {
    const ajv = new Ajv({ strict: false })
    ajv.addKeyword(keywordObjectId)

    const schema = Type.Object({
      _id: ObjectIdSchema()
    })
    const validator = ajv.compile(schema)

    assert.equal(validator({ _id: '507f191e810c19729de860ea' }), true)
    assert.equal(validator({ _id: new MongoObjectId() }), true)
    assert.equal(validator({ _id: { $where: '1==1' } }), false)
    assert.equal(validator({ _id: { $regex: '.*' } }), false)
    assert.equal(validator({ _id: { $ne: null } }), false)
  })

  it('querySyntax with ObjectIdSchema does not treat operator objects as ids', async () => {
    const ajv = new Ajv({ strict: false })
    ajv.addKeyword(keywordObjectId)

    const querySchema = querySyntax(
      Type.Object(
        {
          _id: ObjectIdSchema(),
          text: Type.String()
        },
        { additionalProperties: false }
      )
    )
    const validator = ajv.compile(querySchema)

    assert.equal(validator({ _id: '507f191e810c19729de860ea' }), true)
    assert.equal(validator({ _id: { $ne: '507f191e810c19729de860ea' } }), true)
    assert.equal(validator({ _id: { $where: '1==1' } }), false)
    assert.equal(validator({ $or: [{ _id: { $where: '1==1' } }] }), false)
  })

  it('validators', () => {
    assert.strictEqual(typeof getDataValidator(Type.Object({}), new Ajv()), 'object')
    assert.strictEqual(typeof getValidator(Type.Object({}), new Ajv()), 'function')
    assert.strictEqual(
      typeof getValidator(Type.Intersect([Type.Object({}), Type.Object({})]), new Ajv()),
      'function'
    )
  })
})
