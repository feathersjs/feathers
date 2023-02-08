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

    assert.equal(typeof data._id, 'object')
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

  it('fails on invalid objectids', async () => {
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

    assert.throws(() => validate(data), /invalid objectid for property "_id"/)
  })
})
