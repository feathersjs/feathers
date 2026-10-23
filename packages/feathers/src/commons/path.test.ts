import { describe, it } from 'vitest'
import { strict as assert } from 'assert'
import { stripSlashes } from './index.js'

describe('feathers/commons path', () => {
  it('stripSlashes', () => {
    assert.equal(stripSlashes('some/thing'), 'some/thing')
    assert.equal(stripSlashes('/some/thing'), 'some/thing')
    assert.equal(stripSlashes('some/thing/'), 'some/thing')
    assert.equal(stripSlashes('/some/thing/'), 'some/thing')
    assert.equal(stripSlashes('//some/thing/'), 'some/thing')
    assert.equal(stripSlashes('//some//thing////'), 'some//thing')
  })
})
