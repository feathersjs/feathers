import { strict as assert } from 'assert'
import { _ } from '../src/index.js'

describe('module', () => {
  it('exposes lodash methods under _', () => {
    assert.equal(typeof _.each, 'function')
    assert.equal(typeof _.some, 'function')
    assert.equal(typeof _.every, 'function')
    assert.equal(typeof _.keys, 'function')
    assert.equal(typeof _.values, 'function')
    assert.equal(typeof _.isMatch, 'function')
    assert.equal(typeof _.isEmpty, 'function')
    assert.equal(typeof _.isObject, 'function')
    assert.equal(typeof _.extend, 'function')
    assert.equal(typeof _.omit, 'function')
    assert.equal(typeof _.pick, 'function')
    assert.equal(typeof _.merge, 'function')
  })
})
