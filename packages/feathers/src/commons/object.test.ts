import { describe, it } from 'vitest'
import { strict as assert } from 'assert'
import { isObject, omit, pick } from './index.js'

describe('feathers/commons object', () => {
  it('isObject', () => {
    assert.equal(isObject({}), true)
    assert.equal(isObject([]), false)
    assert.equal(isObject(null), false)
    assert.equal(isObject('object'), false)
  })

  it('pick', () => {
    assert.deepEqual(pick({ name: 'David', first: 1, second: 2 }, 'first', 'second'), {
      first: 1,
      second: 2
    })

    const partial: { name: string; first: number; second?: number } = { name: 'David', first: 1 }

    assert.deepEqual(pick(partial, 'first', 'second'), { first: 1 })
  })

  it('omit', () => {
    const data = { name: 'David', first: 1, second: 2 }

    assert.deepEqual(omit(data, 'first', 'second'), { name: 'David' })
    assert.deepEqual(data, { name: 'David', first: 1, second: 2 }, 'does not modify the original')
  })
})
