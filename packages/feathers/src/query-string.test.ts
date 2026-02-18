import { describe, it } from 'vitest'
import assert from 'assert'
import { stringify, parse } from './query-string.js'

describe('query-string', () => {
  describe('stringify', () => {
    it('serializes flat string and number values', () => {
      assert.strictEqual(stringify({ name: 'Alice', age: 30 }), 'name=Alice&age=30')
    })

    it('serializes boolean values as strings', () => {
      assert.strictEqual(stringify({ active: true, deleted: false }), 'active=true&deleted=false')
    })

    it('skips null and undefined values', () => {
      assert.strictEqual(stringify({ name: 'Alice', removed: null, extra: undefined }), 'name=Alice')
    })

    it('skips object values', () => {
      assert.strictEqual(stringify({ name: 'Alice', age: { $gt: 18 } }), 'name=Alice')
    })

    it('serializes array values as repeated keys', () => {
      assert.strictEqual(stringify({ ids: [1, 2, 3] }), 'ids=1&ids=2&ids=3')
    })

    it('skips null, undefined and object items in arrays', () => {
      assert.strictEqual(stringify({ ids: [1, null, undefined, { $gt: 2 }, 3] }), 'ids=1&ids=3')
    })

    it('returns empty string for empty query', () => {
      assert.strictEqual(stringify({}), '')
    })
  })

  describe('parse', () => {
    it('parses flat string values', () => {
      assert.deepStrictEqual(parse('name=Alice'), { name: 'Alice' })
    })

    it('returns values as strings without type coercion', () => {
      assert.deepStrictEqual(parse('age=30&active=true&deleted=false'), {
        age: '30',
        active: 'true',
        deleted: 'false'
      })
    })

    it('collects repeated keys into an array', () => {
      assert.deepStrictEqual(parse('id=1&id=2&id=3'), { id: ['1', '2', '3'] })
    })

    it('returns empty object for empty string', () => {
      assert.deepStrictEqual(parse(''), {})
    })

    it('decodes encoded characters', () => {
      assert.deepStrictEqual(parse('name=Alice+Smith'), { name: 'Alice Smith' })
    })
  })

  describe('round-trip', () => {
    it('round-trips flat values (as strings)', () => {
      const query = { name: 'Alice', age: 30, active: true }
      assert.deepStrictEqual(parse(stringify(query)), { name: 'Alice', age: '30', active: 'true' })
    })

    it('round-trips array values', () => {
      assert.deepStrictEqual(parse(stringify({ ids: [1, 2, 3] })), { ids: ['1', '2', '3'] })
    })
  })
})
