import assert from 'assert'
import { describe, it, beforeEach } from 'vitest'
import { Router } from './router.js'
import { Application } from './declarations.js'
import { feathers } from './index.js'

describe('routing', () => {
  describe('app.routes', () => {
    let app: Application

    beforeEach(() => {
      app = feathers()

      app.use('/my/service', {
        get(id: string | number) {
          return Promise.resolve({ id })
        }
      })
    })

    it('has app.lookup and app.routes', () => {
      assert.strictEqual(typeof app.lookup, 'function')
      assert.ok(app.routes)
    })

    it('returns null when nothing is found', () => {
      const result = app.lookup('me/service')

      assert.strictEqual(result, null)
    })

    it('returns null for invalid service path', () => {
      assert.strictEqual(app.lookup(null), null)
      // @ts-expect-error Testing invalid lookup
      assert.strictEqual(app.lookup({}), null)
    })

    it('can look up and strips slashes', () => {
      const result = app.lookup('my/service')

      assert.strictEqual(result.service, app.service('/my/service/'))
    })

    it('can look up case insensitive', () => {
      app.routes.caseSensitive = false

      const result = app.lookup('/My/ServicE')

      assert.strictEqual(result.service, app.service('my/service'))
    })

    it('can look up with id', () => {
      const result = app.lookup('/my/service/1234')

      assert.strictEqual(result.service, app.service('/my/service'))
      assert.deepStrictEqual(result.params, {
        __id: '1234'
      })
    })

    it('can look up with params, id and special characters', () => {
      const path = '/test/:first/my/:second'

      app.use(path, {
        async get(id: string | number) {
          return { id }
        }
      })

      const result = app.lookup('/test/me/my/::special/testing')

      assert.strictEqual(result.service, app.service(path))
      assert.deepStrictEqual(result.params, {
        __id: 'testing',
        first: 'me',
        second: '::special'
      })
    })

    it('can register routes with preset params', () => {
      app.routes.insert('/my/service/:__id/preset', {
        service: app.service('/my/service'),
        params: { preset: true }
      })

      const result = app.lookup('/my/service/1234/preset')

      assert.strictEqual(result.service, app.service('/my/service'))
      assert.deepStrictEqual(result.params, {
        preset: true,
        __id: '1234'
      })
    })

    it('can pass route params during a service registration', () => {
      app.use(
        '/other/service',
        {
          async get(id: any) {
            return id
          }
        },
        {
          routeParams: { used: true }
        }
      )

      const result = app.lookup('/other/service/1234')

      assert.strictEqual(result.service, app.service('/other/service'))
      assert.deepStrictEqual(result.params, {
        used: true,
        __id: '1234'
      })
    })

    it('can unregister a service (#2035)', async () => {
      const result = app.lookup('my/service')

      assert.strictEqual(result.service, app.service('/my/service/'))

      await app.unuse('/my/service')

      assert.strictEqual(app.lookup('my/service'), null)
    })
  })

  describe('router', () => {
    it('can lookup and insert a simple path and returns null for invalid path', () => {
      const r = new Router<string>()

      r.insert('/hello/there/you', 'test')

      const result = r.lookup('hello/there/you/')

      assert.deepStrictEqual(result, {
        params: {},
        data: 'test'
      })

      assert.strictEqual(r.lookup('not/there'), null)
      assert.strictEqual(r.lookup('not-me'), null)
    })

    it('can insert data at the root', () => {
      const r = new Router<string>()

      r.insert('', 'hi')

      const result = r.lookup('/')

      assert.deepStrictEqual(result, {
        params: {},
        data: 'hi'
      })
    })

    it('can insert with placeholder and has proper specificity', () => {
      const r = new Router<string>()

      r.insert('/hello/:id', 'one')
      r.insert('/hello/:id/you', 'two')
      r.insert('/hello/:id/:other', 'three')

      const first = r.lookup('hello/there/')

      assert.throws(() => r.insert('/hello/:id/you', 'two'), {
        message: 'Path hello/:id/you already exists'
      })

      assert.deepStrictEqual(first, {
        params: { id: 'there' },
        data: 'one'
      })

      const second = r.lookup('hello/yes/you')

      assert.deepStrictEqual(second, {
        params: { id: 'yes' },
        data: 'two'
      })

      const third = r.lookup('hello/yes/they')

      assert.deepStrictEqual(third, {
        params: {
          id: 'yes',
          other: 'they'
        },
        data: 'three'
      })

      assert.strictEqual(r.lookup('hello/yes/they/here'), null)
    })

    it('routes custom method paths alongside standard service routes', () => {
      const r = new Router<{ service: string; method?: string }>()

      // Standard service routes (like app.use adds)
      r.insert('/messages', { service: 'messages' })
      r.insert('/messages/:__id', { service: 'messages' })

      // Custom method paths
      r.insert('/messages/:__id/status', { service: 'messages', method: 'status' })
      r.insert('/messages/stats', { service: 'messages', method: 'stats' })

      // Test standard find
      const find = r.lookup('/messages')
      assert.deepStrictEqual(find, {
        params: {},
        data: { service: 'messages' }
      })

      // Test standard get
      const get = r.lookup('/messages/123')
      assert.deepStrictEqual(get, {
        params: { __id: '123' },
        data: { service: 'messages' }
      })

      // Test custom path with id
      const status = r.lookup('/messages/123/status')
      assert.deepStrictEqual(status, {
        params: { __id: '123' },
        data: { service: 'messages', method: 'status' }
      })

      // Test literal path (stats) - should NOT be confused with get('stats')
      const stats = r.lookup('/messages/stats')
      assert.deepStrictEqual(stats, {
        params: {},
        data: { service: 'messages', method: 'stats' }
      })
    })

    it('works with different placeholders in different paths (#2327)', () => {
      const r = new Router<string>()

      r.insert('/hello/:id', 'one')
      r.insert('/hello/:test/you', 'two')
      r.insert('/hello/:test/:two/hi/:three', 'three')
      r.insert('/hello/:test/:two/hi', 'four')

      assert.deepStrictEqual(r.lookup('/hello/there'), {
        params: { id: 'there' },
        data: 'one'
      })
      assert.deepStrictEqual(r.lookup('/hello/there/you'), {
        params: { test: 'there' },
        data: 'two'
      })
      assert.strictEqual(r.lookup('/hello/there/bla'), null)
      assert.deepStrictEqual(r.lookup('/hello/there/maybe/hi'), {
        params: { test: 'there', two: 'maybe' },
        data: 'four'
      })
      assert.deepStrictEqual(r.lookup('/hello/there/maybe/hi/test'), {
        params: { three: 'test', two: 'maybe', test: 'there' },
        data: 'three'
      })
    })

    it('can remove paths (#2035)', () => {
      const r = new Router<string>()

      r.insert('/hello/:id', 'one')
      r.insert('/hello/:test/you', 'two')
      r.insert('/hello/here/thing', 'else')

      assert.deepStrictEqual(r.lookup('hello/there'), { params: { id: 'there' }, data: 'one' })

      r.remove('/hello/:id')

      assert.deepStrictEqual(r.lookup('hello/here/you'), { params: { test: 'here' }, data: 'two' })
      assert.deepStrictEqual(r.lookup('hello/here/thing'), { params: {}, data: 'else' })
      assert.strictEqual(r.lookup('hello/there'), null)

      r.remove('/hello/:test/you')
      assert.deepStrictEqual(r.lookup('hello/here/you'), null)
      assert.deepStrictEqual(r.lookup('hello/here/thing'), { params: {}, data: 'else' })

      r.remove('/hello/here/thing')
      assert.ok(!r.root.hasChildren)
    })

    it('re-initialize a service with children. (#3432)', () => {
      const r = new Router<string>()

      r.insert('/hello', 'one')
      r.insert('/hello/world', 'else')

      assert.deepStrictEqual(r.lookup('hello'), { params: {}, data: 'one' })

      r.remove('/hello')

      assert.deepStrictEqual(r.lookup('hello/world'), { params: {}, data: 'else' })

      r.insert('/hello', 'two')

      assert.deepStrictEqual(r.lookup('hello'), { params: {}, data: 'two' })
      assert.deepStrictEqual(r.lookup('hello/world'), { params: {}, data: 'else' })
    })
  })
})
