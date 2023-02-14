import Ajv from 'ajv'
import assert from 'assert'
import { ObjectId as MongoObjectId } from 'mongodb'
import { FromSchema } from '../src'
import { querySyntax, ObjectIdSchema } from '../src/json-schema'

describe('@feathersjs/schema/json-schema', () => {
  it('querySyntax works with no properties', async () => {
    const schema = {
      type: 'object',
      properties: querySyntax({})
    }

    new Ajv().compile(schema)
  })

  it('querySyntax with extensions', async () => {
    const schema = {
      name: {
        type: 'string'
      },
      age: {
        type: 'number'
      }
    } as const

    const querySchema = {
      type: 'object',
      properties: querySyntax(schema, {
        name: {
          $ilike: {
            type: 'string'
          }
        },
        age: {
          $value: {
            type: 'null'
          }
        }
      } as const)
    } as const

    type Query = FromSchema<typeof querySchema>

    const q: Query = {
      name: {
        $ilike: 'hello'
      },
      age: {
        $value: null,
        $gte: 42
      }
    }

    const validator = new Ajv({ strict: false }).compile(schema)

    assert.ok(validator(q))
  })

  // Test ObjectId validation
  it('ObjectId', async () => {
    const schema = {
      type: 'object',
      properties: {
        _id: ObjectIdSchema()
      }
    }

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
})
