import assert from 'assert'
import { ObjectId } from 'mongodb'
import { resolveObjectId, resolveQueryObjectId } from '../src'

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

  it('resolveQueryObjectId with undefined value', async () => {
    await resolveQueryObjectId(undefined)
    assert.ok('Undefined value does not throw exception')
  })
})
