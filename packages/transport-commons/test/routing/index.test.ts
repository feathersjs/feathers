/* eslint-disable @typescript-eslint/ban-ts-comment */
import assert from 'assert'
import { feathers, Application } from '@feathersjs/feathers'
import { routing } from '../../src/routing'

describe('app.routes', () => {
  let app: Application

  beforeEach(() => {
    app = feathers().configure(routing())

    app.use('/my/service', {
      get(id: string | number) {
        return Promise.resolve({ id })
      }
    })
  })

  it('does nothing when configured twice', () => {
    feathers().configure(routing()).configure(routing())
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
    // @ts-ignore
    assert.strictEqual(app.lookup({}), null)
  })

  it('can look up and strips slashes', () => {
    const result = app.lookup('my/service')

    assert.strictEqual(result.service, app.service('/my/service/'))
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
})
