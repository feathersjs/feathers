import assert from 'assert'
import { describe, it } from 'vitest'
import { KoaRouter } from './koa-router.js'
import { feathers } from 'feathers'

describe('KoaRouter', () => {
  describe('basic routing', () => {
    it('can insert and lookup exact routes', () => {
      const router = new KoaRouter<string>()

      router.insert('/users', 'users-handler')
      router.insert('/posts', 'posts-handler')

      const usersResult = router.lookup('/users')
      assert.deepStrictEqual(usersResult, {
        data: 'users-handler',
        params: Object.create(null)
      })

      const postsResult = router.lookup('/posts')
      assert.deepStrictEqual(postsResult, {
        data: 'posts-handler',
        params: Object.create(null)
      })

      assert.strictEqual(router.lookup('/nonexistent'), null)
    })

    it('handles root path correctly', () => {
      const router = new KoaRouter<string>()

      router.insert('/', 'root-handler')

      const rootResult = router.lookup('/')
      const emptyResult = router.lookup('')

      assert.deepStrictEqual(rootResult, {
        data: 'root-handler',
        params: Object.create(null)
      })
      assert.deepStrictEqual(emptyResult, {
        data: 'root-handler',
        params: Object.create(null)
      })
    })
  })

  describe('Koa parameter syntax', () => {
    it('supports :param syntax', () => {
      const router = new KoaRouter<string>()

      router.insert('/users/:id', 'user-handler')
      router.insert('/posts/:postId/comments/:commentId', 'comment-handler')

      const userResult = router.lookup('/users/123')
      const expectedUserParams = Object.create(null)
      expectedUserParams.id = '123'
      assert.deepStrictEqual(userResult, {
        data: 'user-handler',
        params: expectedUserParams
      })

      const commentResult = router.lookup('/posts/456/comments/789')
      const expectedCommentParams = Object.create(null)
      expectedCommentParams.postId = '456'
      expectedCommentParams.commentId = '789'
      assert.deepStrictEqual(commentResult, {
        data: 'comment-handler',
        params: expectedCommentParams
      })
    })

    it('handles missing parameters', () => {
      const router = new KoaRouter<string>()

      router.insert('/users/:id', 'user-handler')

      assert.strictEqual(router.lookup('/users'), null)
      assert.strictEqual(router.lookup('/users/'), null)
    })

    it('handles parameters with special characters', () => {
      const router = new KoaRouter<string>()

      router.insert('/users/:id', 'user-handler')

      const result = router.lookup('/users/user-123_test')
      const expectedParams = Object.create(null)
      expectedParams.id = 'user-123_test'
      assert.deepStrictEqual(result, {
        data: 'user-handler',
        params: expectedParams
      })
    })
  })

  describe('wildcard support', () => {
    it('supports * wildcard syntax', () => {
      const router = new KoaRouter<string>()

      router.insert('/docs/*path', 'docs-handler')
      router.insert('/static/*path', 'static-handler')

      const docsResult = router.lookup('/docs/api/users/guide')
      const expectedDocsParams = Object.create(null)
      expectedDocsParams['path'] = ['api', 'users', 'guide']
      assert.deepStrictEqual(docsResult, {
        data: 'docs-handler',
        params: expectedDocsParams
      })

      const staticResult = router.lookup('/static/css/main.css')
      const expectedStaticParams = Object.create(null)
      expectedStaticParams['path'] = ['css', 'main.css']
      assert.deepStrictEqual(staticResult, {
        data: 'static-handler',
        params: expectedStaticParams
      })
    })

    it('handles empty wildcard matches', () => {
      const router = new KoaRouter<string>()

      router.insert('/docs/*path', 'docs-handler')

      const result = router.lookup('/docs/something')
      assert.ok(result, 'Should match /docs/something')
    })
  })

  describe('case sensitivity', () => {
    it('is case sensitive by default (Koa behavior)', () => {
      const router = new KoaRouter<string>()

      router.insert('/Users', 'users-handler')

      // Case sensitive by default
      assert.strictEqual(router.lookup('/users'), null)
      assert.deepStrictEqual(router.lookup('/Users'), {
        data: 'users-handler',
        params: Object.create(null)
      })
    })

    it('can be set to case insensitive via constructor', () => {
      const router = new KoaRouter<string>({ caseSensitive: false })

      router.insert('/Users', 'users-handler')

      assert.deepStrictEqual(router.lookup('/users'), {
        data: 'users-handler',
        params: Object.create(null)
      })
      assert.deepStrictEqual(router.lookup('/USERS'), {
        data: 'users-handler',
        params: Object.create(null)
      })
    })
  })

  describe('route management', () => {
    it('prevents duplicate routes', () => {
      const router = new KoaRouter<string>()

      router.insert('/users', 'first-handler')

      assert.throws(() => {
        router.insert('/users', 'second-handler')
      }, /already exists/)
    })

    it('can remove routes', () => {
      const router = new KoaRouter<string>()

      router.insert('/users', 'users-handler')
      router.insert('/posts', 'posts-handler')

      assert.deepStrictEqual(router.lookup('/users'), {
        data: 'users-handler',
        params: Object.create(null)
      })

      router.remove('/users')

      assert.strictEqual(router.lookup('/users'), null)
      assert.deepStrictEqual(router.lookup('/posts'), {
        data: 'posts-handler',
        params: Object.create(null)
      })
    })

    it('handles removing non-existent routes gracefully', () => {
      const router = new KoaRouter<string>()

      router.remove('/nonexistent')
    })
  })

  describe('Koa compatibility patterns', () => {
    it('matches common Koa patterns', () => {
      const router = new KoaRouter<string>()

      router.insert('/api/v1/users/:id', 'user-api')
      router.insert('/files/:category/:filename', 'file-handler')

      const userResult = router.lookup('/api/v1/users/123')
      const expectedUserParams = Object.create(null)
      expectedUserParams.id = '123'
      assert.deepStrictEqual(userResult, {
        data: 'user-api',
        params: expectedUserParams
      })

      const fileResult = router.lookup('/files/images/photo.jpg')
      const expectedFileParams = Object.create(null)
      expectedFileParams.category = 'images'
      expectedFileParams.filename = 'photo.jpg'
      assert.deepStrictEqual(fileResult, {
        data: 'file-handler',
        params: expectedFileParams
      })
    })
  })

  describe('edge cases', () => {
    it('handles paths with regex special characters', () => {
      const router = new KoaRouter<string>()

      router.insert('/test.html', 'test-handler')
      router.insert('/api/v1.0', 'api-handler')

      assert.deepStrictEqual(router.lookup('/test.html'), {
        data: 'test-handler',
        params: Object.create(null)
      })

      assert.deepStrictEqual(router.lookup('/api/v1.0'), {
        data: 'api-handler',
        params: Object.create(null)
      })

      assert.strictEqual(router.lookup('/testXhtml'), null)
      assert.strictEqual(router.lookup('/api/v1X0'), null)
    })
  })

  describe('Feathers integration', () => {
    it('works as a replacement router with assignment', () => {
      interface Services {
        'api/posts/:postId/comments/:commentId': {
          get(id: string): Promise<{ id: string; type: string }>
        }
      }

      const app = feathers<Services>()
      app.routes = new KoaRouter()

      app.use('api/posts/:postId/comments/:commentId', {
        async get(id: string) {
          return { id, type: 'comment' }
        }
      })

      const result = app.lookup('/api/posts/456/comments/789')
      assert.ok(result)
      assert.ok(result.service)
      assert.deepStrictEqual(result.params, {
        postId: '456',
        commentId: '789'
      })
    })

    it('supports wildcard routes with services', () => {
      interface Services {
        'static/*path': {
          find(): Promise<{ type: string }>
        }
      }

      const app = feathers<Services>()
      app.routes = new KoaRouter()

      app.use('static/*path', {
        async find() {
          return { type: 'static-file' }
        }
      })

      const result = app.lookup('/static/images/logo.png')
      assert.ok(result)
      assert.ok(result.service)
      assert.deepStrictEqual(result.params, {
        path: ['images', 'logo.png']
      })
    })

    it('handles service registration and unregistration', async () => {
      interface Services {
        'temp/:id': {
          get(id: string): Promise<{ id: string }>
        }
      }

      const app = feathers<Services>()
      app.routes = new KoaRouter()

      app.use('temp/:id', {
        async get(id: string) {
          return { id }
        }
      })

      let result = app.lookup('/temp/123')
      assert.ok(result)
      assert.deepStrictEqual(result.params, { id: '123' })

      await app.unuse('temp/:id')
      result = app.lookup('/temp/123')
      assert.strictEqual(result, null)
    })

    it('respects case sensitivity with services', () => {
      interface Services {
        'Users/:id': {
          get(id: string): Promise<{ id: string }>
        }
      }

      const app = feathers<Services>()
      const router = new KoaRouter()
      router.caseSensitive = false
      app.routes = router

      app.use('Users/:id', {
        async get(id: string) {
          return { id }
        }
      })

      // Should match regardless of case
      const result1 = app.lookup('/users/123')
      const result2 = app.lookup('/USERS/123')

      assert.ok(result1)
      assert.ok(result2)
      assert.deepStrictEqual(result1.params, { id: '123' })
      assert.deepStrictEqual(result2.params, { id: '123' })
    })
  })
})
