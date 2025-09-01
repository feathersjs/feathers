import assert from 'assert'
import { describe, it, beforeEach } from 'vitest'
import { Router } from './router.js'
import { Router as Router2 } from './router2.js'
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
        params: Object.create(null),
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
        params: Object.create(null),
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

      const expectedParams1 = Object.create(null)
      expectedParams1.id = 'there'
      assert.deepStrictEqual(first, {
        params: expectedParams1,
        data: 'one'
      })

      const second = r.lookup('hello/yes/you')

      const expectedParams2 = Object.create(null)
      expectedParams2.id = 'yes'
      assert.deepStrictEqual(second, {
        params: expectedParams2,
        data: 'two'
      })

      const third = r.lookup('hello/yes/they')

      const expectedParams3 = Object.create(null)
      expectedParams3.id = 'yes'
      expectedParams3.other = 'they'
      assert.deepStrictEqual(third, {
        params: expectedParams3,
        data: 'three'
      })

      assert.strictEqual(r.lookup('hello/yes/they/here'), null)
    })

    it('works with different placeholders in different paths (#2327)', () => {
      const r = new Router<string>()

      r.insert('/hello/:id', 'one')
      r.insert('/hello/:test/you', 'two')
      r.insert('/hello/:test/:two/hi/:three', 'three')
      r.insert('/hello/:test/:two/hi', 'four')

      const params1 = Object.create(null)
      params1.id = 'there'
      assert.deepStrictEqual(r.lookup('/hello/there'), {
        params: params1,
        data: 'one'
      })
      const params2 = Object.create(null)
      params2.test = 'there'
      assert.deepStrictEqual(r.lookup('/hello/there/you'), {
        params: params2,
        data: 'two'
      })
      assert.strictEqual(r.lookup('/hello/there/bla'), null)
      const params3 = Object.create(null)
      params3.test = 'there'
      params3.two = 'maybe'
      assert.deepStrictEqual(r.lookup('/hello/there/maybe/hi'), {
        params: params3,
        data: 'four'
      })
      const params4 = Object.create(null)
      params4.three = 'test'
      params4.two = 'maybe'
      params4.test = 'there'
      assert.deepStrictEqual(r.lookup('/hello/there/maybe/hi/test'), {
        params: params4,
        data: 'three'
      })
    })

    it('can remove paths (#2035)', () => {
      const r = new Router<string>()

      r.insert('/hello/:id', 'one')
      r.insert('/hello/:test/you', 'two')
      r.insert('/hello/here/thing', 'else')

      const removeParams1 = Object.create(null)
      removeParams1.id = 'there'
      assert.deepStrictEqual(r.lookup('hello/there'), { params: removeParams1, data: 'one' })

      r.remove('/hello/:id')

      const removeParams2 = Object.create(null)
      removeParams2.test = 'here'
      assert.deepStrictEqual(r.lookup('hello/here/you'), { params: removeParams2, data: 'two' })
      assert.deepStrictEqual(r.lookup('hello/here/thing'), { params: Object.create(null), data: 'else' })
      assert.strictEqual(r.lookup('hello/there'), null)

      r.remove('/hello/:test/you')
      assert.deepStrictEqual(r.lookup('hello/here/you'), null)
      assert.deepStrictEqual(r.lookup('hello/here/thing'), { params: Object.create(null), data: 'else' })

      r.remove('/hello/here/thing')
      assert.ok(!r.root.hasChildren)
    })

    it('re-initialize a service with children. (#3432)', () => {
      const r = new Router<string>()

      r.insert('/hello', 'one')
      r.insert('/hello/world', 'else')

      assert.deepStrictEqual(r.lookup('hello'), { params: Object.create(null), data: 'one' })

      r.remove('/hello')

      assert.deepStrictEqual(r.lookup('hello/world'), { params: Object.create(null), data: 'else' })

      r.insert('/hello', 'two')

      assert.deepStrictEqual(r.lookup('hello'), { params: Object.create(null), data: 'two' })
      assert.deepStrictEqual(r.lookup('hello/world'), { params: Object.create(null), data: 'else' })
    })
  })

  describe('router performance benchmark', () => {
    it('compares router.ts vs router2.ts performance', () => {
      const router1 = new Router<string>()
      const router2 = new Router2<string>()

      // Setup identical routes for both routers
      const routes = [
        '/api/users',
        '/api/users/:id',
        '/api/posts',
        '/api/posts/:id',
        '/api/posts/:id/comments',
        '/api/posts/:id/comments/:commentId',
        '/api/categories/:category/posts',
        '/api/categories/:category/posts/:id',
        '/health',
        '/status',
        '/metrics',
        '/docs/:section',
        '/docs/:section/:page'
      ]

      // Insert routes into both routers
      routes.forEach((route, i) => {
        const data = `handler-${i}`
        router1.insert(route, data)
        router2.insert(route, data)
      })

      // Test paths for lookup
      const testPaths = [
        '/api/users',
        '/api/users/123',
        '/api/posts/456',
        '/api/posts/456/comments/789',
        '/api/categories/tech/posts/101',
        '/health',
        '/docs/api/endpoints',
        '/nonexistent/path'
      ]

      const iterations = 100000

      // Benchmark optimized router (router.ts)
      const start1 = performance.now()
      for (let i = 0; i < iterations; i++) {
        for (const path of testPaths) {
          router1.lookup(path)
        }
      }
      const end1 = performance.now()
      const optimizedTime = end1 - start1

      // Benchmark old router (router2.ts)
      const start2 = performance.now()
      for (let i = 0; i < iterations; i++) {
        for (const path of testPaths) {
          router2.lookup(path)
        }
      }
      const end2 = performance.now()
      const oldTime = end2 - start2

      const improvement = (((oldTime - optimizedTime) / oldTime) * 100).toFixed(1)

      console.log(`\n=== Router Performance Benchmark ===`)
      console.log(`Test iterations: ${iterations.toLocaleString()} x ${testPaths.length} paths`)
      console.log(`Optimized router (router.ts):  ${optimizedTime.toFixed(2)}ms`)
      console.log(`Old router (router2.ts):       ${oldTime.toFixed(2)}ms`)
      console.log(`Performance improvement: ${improvement}%`)
      console.log(`Speed ratio: ${(oldTime / optimizedTime).toFixed(2)}x faster`)

      // Verify both routers return functionally identical results
      for (const path of testPaths) {
        const result1 = router1.lookup(path)
        const result2 = router2.lookup(path)

        if (result1 === null && result2 === null) continue

        // Compare data and params keys/values, ignoring prototype differences
        assert.strictEqual(result1?.data, result2?.data, `Data differs for path: ${path}`)
        assert.deepStrictEqual(
          Object.keys(result1?.params || {}),
          Object.keys(result2?.params || {}),
          `Param keys differ for path: ${path}`
        )

        for (const key of Object.keys(result1?.params || {})) {
          assert.strictEqual(
            result1.params[key],
            result2.params[key],
            `Param value '${key}' differs for path: ${path}`
          )
        }
      }

      // Basic performance assertion - optimized router should be faster
      assert.ok(optimizedTime <= oldTime, 'Optimized router should be at least as fast as old router')
    })
  })
})
