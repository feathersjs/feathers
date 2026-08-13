import { Ajv } from '@feathersjs/schema'
import assert from 'assert'
import { ObjectId } from 'mongodb'
import { keywordObjectId, resolveObjectId, resolveQueryObjectId } from '../src'

describe('ObjectId resolvers', () => {
  it('resolveObjectId', async () => {
    const oid = await resolveObjectId('5f9e3c1b9b9b9b9b9b9b9b9b')

    assert.ok(oid instanceof ObjectId)
  })

  it('resolveQueryObjectId', async () => {
    const oid = await resolveQueryObjectId('5f9e3c1b9b9b9b9b9b9b9b9b')

    assert.ok(oid instanceof ObjectId)
  })

  it('resolveQueryObjectId with object', async () => {
    const oids = await resolveQueryObjectId({
      $in: ['5f9e3c1b9b9b9b9b9b9b9b9b'],
      $ne: '5f9e3c1b9b9b9b9b9b9b9b9a'
    })

    assert.ok(oids.$in && oids.$in[0] instanceof ObjectId)
    assert.ok(oids.$ne instanceof ObjectId)
  })

  it('resolveQueryObjectId with falsey value', async () => {
    await resolveQueryObjectId(undefined)
    await resolveQueryObjectId(null)
    await resolveQueryObjectId(0)

    assert.ok('Falsey value does not throw exception')
  })
})

const validator = new Ajv({ coerceTypes: true })
validator.addKeyword(keywordObjectId)

describe('objectid keyword', () => {
  it('converts objectid strings when keyword is used', async () => {
    const schema = {
      type: 'object',
      properties: {
        _id: { type: 'string', objectid: true },
        otherId: { type: 'string', objectid: true }
      },
      additionalProperties: false
    }
    const validate = validator.compile(schema)

    const data = {
      _id: '622585621f3996763f1e4444',
      otherId: '622585621f3996763f1e5555'
    }
    assert.equal(typeof data._id, 'string')
    assert.equal(typeof data.otherId, 'string')

    // runs converters
    validate(data)

    assert.ok((data._id as any) instanceof ObjectId)
    assert.equal(typeof data.otherId, 'object')
  })

  it('does not convert objectid strings without keyword', async () => {
    const schema = {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        otherId: { type: 'string' }
      },
      additionalProperties: false
    }
    const validate = validator.compile(schema)

    const data = {
      _id: '622585621f3996763f1e4444',
      otherId: '622585621f3996763f1e5555'
    }
    assert.equal(typeof data._id, 'string')
    assert.equal(typeof data.otherId, 'string')

    // runs converters
    validate(data)

    assert.equal(typeof data._id, 'string')
    assert.equal(typeof data.otherId, 'string')
  })

  it('fails validation on invalid objectids', async () => {
    const schema = {
      type: 'object',
      properties: {
        _id: { type: 'string', objectid: true }
      },
      additionalProperties: false
    }
    const validate = validator.compile(schema)

    const data = {
      _id: '622585621f3996763f1e444'
    }
    assert.equal(typeof data._id, 'string')

    assert.equal(validate(data), false)
    assert.equal(validate.errors?.[0].keyword, 'objectid')
  })

  it('accepts ObjectId instances', async () => {
    const schema = {
      type: 'object',
      properties: {
        _id: { type: 'object', objectid: true }
      },
      additionalProperties: false
    }
    const validate = validator.compile(schema)
    const data = { _id: new ObjectId() }

    assert.equal(validate(data), true)
    assert.ok(data._id instanceof ObjectId)
  })

  it('rejects operator objects that are not ObjectId instances', async () => {
    const schema = {
      type: 'object',
      properties: {
        _id: { type: 'object', objectid: true }
      },
      additionalProperties: false
    }
    const validate = validator.compile(schema)

    assert.equal(validate({ _id: { $where: '1==1' } }), false)
    assert.equal(validate.errors?.[0].keyword, 'objectid')
    assert.equal(validate({ _id: { $ne: null } }), false)
    assert.equal(validate({ _id: { $regex: '.*' } }), false)
  })

  it('continues validating nullable unions when an objectid branch fails', async () => {
    const nullableValidator = new Ajv({ coerceTypes: true, useDefaults: true })
    nullableValidator.addKeyword(keywordObjectId)

    const schema: any = {
      type: 'object',
      properties: {
        refId: {
          anyOf: [{ type: 'string', objectid: true }, { type: 'null' }],
          default: null
        }
      },
      additionalProperties: false
    }
    const validate = nullableValidator.compile(schema)
    const data: { refId?: ObjectId | null } = {}

    assert.equal(validate(data), true)
    assert.equal(data.refId, null)
  })
})
