/* eslint-disable @typescript-eslint/ban-ts-comment */
import fetch from 'node-fetch'
import { strict as assert } from 'assert'
import { feathers } from '@feathersjs/feathers'
import { default as init, FetchClient } from '../src'

describe('REST client tests', function () {
  it('is built correctly', () => {
    const transports = init()

    assert.strictEqual(typeof init, 'function')
    assert.strictEqual(typeof transports.superagent, 'function')
    assert.strictEqual(typeof transports.fetch, 'function')
    assert.strictEqual(typeof transports.axios, 'function')
  })

  it('throw errors when no connection is provided', () => {
    const transports = init()

    try {
      // @ts-ignore
      transports.fetch()
    } catch (e: any) {
      assert.strictEqual(e.message, 'fetch has to be provided to feathers-rest')
    }
  })

  it('app has the rest attribute', () => {
    const app = feathers()

    app.configure(init('http://localhost:8889').fetch(fetch))

    assert.ok((app as any).rest)
  })

  it('throws an error when configured twice', () => {
    const app = feathers()

    app.configure(init('http://localhost:8889').fetch(fetch))

    try {
      app.configure(init('http://localhost:8889').fetch(fetch))
      assert.ok(false, 'Should never get here')
    } catch (e: any) {
      assert.strictEqual(e.message, 'Only one default client provider can be configured')
    }
  })

  it('errors when id property for get, patch, update or remove is undefined', async () => {
    const app = feathers().configure(init('http://localhost:8889').fetch(fetch))

    const service = app.service('todos')

    await assert.rejects(() => service.get(undefined), {
      message: "id for 'get' can not be undefined"
    })

    await assert.rejects(() => service.remove(undefined), {
      message: "id for 'remove' can not be undefined, only 'null' when removing multiple entries"
    })

    await assert.rejects(() => service.update(undefined, {}), {
      message: "id for 'update' can not be undefined, only 'null' when updating multiple entries"
    })

    await assert.rejects(() => service.patch(undefined, {}), {
      message: "id for 'patch' can not be undefined, only 'null' when updating multiple entries"
    })
  })

  it('uses a custom client', async () => {
    const app = feathers()
    class MyFetchClient extends FetchClient {
      find() {
        return Promise.resolve({
          connection: this.connection,
          base: this.base,
          message: 'Custom fetch client'
        })
      }
    }

    app.configure(init('http://localhost:8889').fetch(fetch, {}, MyFetchClient))

    const data = await app.service('messages').find()

    assert.deepStrictEqual(data, {
      connection: fetch,
      base: 'http://localhost:8889/messages',
      message: 'Custom fetch client'
    })
  })

  it('uses a custom client as second arg', async () => {
    const app = feathers()
    class MyFetchClient extends FetchClient {
      find() {
        return Promise.resolve({
          connection: this.connection,
          base: this.base,
          message: 'Custom fetch client'
        })
      }
    }

    app.configure(init('http://localhost:8889').fetch(fetch, MyFetchClient))

    const data = await app.service('messages').find()

    assert.deepStrictEqual(data, {
      connection: fetch,
      base: 'http://localhost:8889/messages',
      message: 'Custom fetch client'
    })
  })

  it('replace placeholder in route URLs', async () => {
    const app = feathers()
    let expectedValue: string | null = null
    class MyFetchClient extends FetchClient {
      request(options: any, _params: any) {
        assert.equal(options.url, expectedValue)
        return Promise.resolve()
      }
    }
    app.configure(init('http://localhost:8889').fetch(fetch, {}, MyFetchClient))

    expectedValue = 'http://localhost:8889/admin/todos'
    await app.service(':slug/todos').find({
      route: {
        slug: 'admin'
      }
    })
    await app.service(':slug/todos').create(
      {},
      {
        route: {
          slug: 'admin'
        }
      }
    )
    expectedValue = 'http://localhost:8889/admin/todos/0'
    await app.service(':slug/todos').get(0, {
      route: {
        slug: 'admin'
      }
    })
    expectedValue = 'http://localhost:8889/admin/todos/0'
    await app.service(':slug/todos').patch(
      0,
      {},
      {
        route: {
          slug: 'admin'
        }
      }
    )
    expectedValue = 'http://localhost:8889/admin/todos/0'
    await app.service(':slug/todos').update(
      0,
      {},
      {
        route: {
          slug: 'admin'
        }
      }
    )
    expectedValue = 'http://localhost:8889/admin/todos/0'
    await app.service(':slug/todos').remove(0, {
      route: {
        slug: 'admin'
      }
    })
  })
})
