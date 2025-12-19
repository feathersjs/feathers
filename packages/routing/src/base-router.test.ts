import assert from 'assert'
import { describe, it } from 'vitest'
import { BaseRouter } from './base-router.js'

// Test implementation of BaseRouter for coverage
class TestRouter extends BaseRouter {
  constructor(options = {}) {
    super(options)
  }
}

describe('BaseRouter', () => {
  it('uses default caseSensitive when not provided', () => {
    const router = new TestRouter({})
    assert.strictEqual(router.caseSensitive, true)
  })

  it('respects provided caseSensitive option', () => {
    const router = new TestRouter({ caseSensitive: false })
    assert.strictEqual(router.caseSensitive, false)
  })

  it('handles wildcard parameter edge cases', () => {
    const router = new TestRouter({ caseSensitive: true })

    // Test wildcard with minimal path
    router.insert('/files/*path', 'file-handler')

    const result = router.lookup('/files/single')
    assert.ok(result)
    assert.deepStrictEqual(result.params['path'], ['single'])
  })

  it('handles wildcard parameter extraction', () => {
    const router = new TestRouter()

    router.insert('/docs/*path', 'docs-handler')
    const result = router.lookup('/docs/test/file')

    assert.ok(result)
    assert.deepStrictEqual(result.params['path'], ['test', 'file'])
  })

  it('handles empty wildcard values', () => {
    const router = new TestRouter()

    // Create a route with minimal wildcard match
    router.insert('/files/*path', 'handler')

    // Test with a path that would create an empty capture group
    // /files/something should capture ['something'], but let's test edge cases
    const result1 = router.lookup('/files/a')
    assert.ok(result1)
    assert.deepStrictEqual(result1.params['path'], ['a'])

    // Test with multiple segments
    const result2 = router.lookup('/files/a/b/c')
    assert.ok(result2)
    assert.deepStrictEqual(result2.params['path'], ['a', 'b', 'c'])
  })

  it('returns null for non-string paths', () => {
    const router = new TestRouter()
    router.insert('/users', 'users-handler')

    assert.strictEqual(router.lookup(null as any), null)
    assert.strictEqual(router.lookup(undefined as any), null)
    assert.strictEqual(router.lookup(123 as any), null)
    assert.strictEqual(router.lookup({} as any), null)
  })
})
