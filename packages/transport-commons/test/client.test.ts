/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-empty-function */
import assert from 'assert'
import { EventEmitter } from 'events'
import { CustomMethods } from '@feathersjs/feathers'
import { NotAuthenticated } from '@feathersjs/errors'
import { Service, SocketService } from '../src/client'

declare type DummyCallback = (err: any, data?: any) => void

describe('client', () => {
  let connection: any
  let testData: any
  let service: SocketService & CustomMethods<{ customMethod: any }> & EventEmitter

  beforeEach(() => {
    connection = new EventEmitter()
    testData = { data: 'testing ' }
    service = new Service({
      events: ['created'],
      name: 'todos',
      method: 'emit',
      connection
    }) as any
  })

  it('sets `events` property on service', () => {
    assert.ok(service.events)
  })

  it('throws an error when the emitter does not have the method', () => {
    const clientService = new Service({
      name: 'todos',
      method: 'emit',
      connection: {}
    }) as Service & EventEmitter

    try {
      clientService.eventNames()
      assert.ok(false, 'Should never get here')
    } catch (e: any) {
      assert.strictEqual(e.message, "Can not call 'eventNames' on the client service connection")
    }

    try {
      clientService.on('test', () => {})
      assert.ok(false, 'Should never get here')
    } catch (e: any) {
      assert.strictEqual(e.message, "Can not call 'on' on the client service connection")
    }
  })

  it('allows chaining event listeners', () => {
    assert.strictEqual(
      service,
      service.on('thing', () => {})
    )
    assert.strictEqual(
      service,
      service.once('other thing', () => {})
    )
  })

  it('initializes and emits namespaced events', (done) => {
    connection.once('todos test', (data: any) => {
      assert.deepStrictEqual(data, testData)
      done()
    })
    service.emit('test', testData)
  })

  it('has other emitter methods', () => {
    assert.ok(service.eventNames())
  })

  it('can receive pathed events', (done) => {
    service.once('thing', (data) => {
      assert.deepStrictEqual(data, testData)
      done()
    })

    connection.emit('todos thing', testData)
  })

  it('sends all service and custom methods with acknowledgement', async () => {
    const idCb = (_path: any, id: any, _params: any, callback: DummyCallback) => callback(null, { id })
    const idDataCb = (_path: any, _id: any, data: any, _params: any, callback: DummyCallback) =>
      callback(null, data)
    const dataCb = (_path: any, data: any, _params: any, callback: DummyCallback) => {
      data.created = true
      callback(null, data)
    }

    connection.once('create', dataCb)
    service.methods('customMethod')

    let res = await service.create(testData)

    assert.ok(res.created)

    connection.once('get', idCb)
    res = await service.get(1)
    assert.deepStrictEqual(res, { id: 1 })

    connection.once('remove', idCb)
    res = await service.remove(12)
    assert.deepStrictEqual(res, { id: 12 })

    connection.once('update', idDataCb)
    res = await service.update(12, testData)
    assert.deepStrictEqual(res, testData)

    connection.once('patch', idDataCb)
    res = await service.patch(12, testData)
    assert.deepStrictEqual(res, testData)

    connection.once('customMethod', dataCb)
    res = await service.customMethod({ message: 'test' })
    assert.deepStrictEqual(res, {
      created: true,
      message: 'test'
    })

    connection.once('find', (_path: any, params: any, callback: DummyCallback) => callback(null, { params }))

    res = await service.find({ query: { test: true } })
    assert.deepStrictEqual(res, {
      params: { test: true }
    })
  })

  it('replace placeholder in service paths', async () => {
    service = new Service({
      events: ['created'],
      name: ':slug/todos',
      method: 'emit',
      connection
    }) as any

    const idCb = (path: any, _id: any, _params: any, callback: DummyCallback) => callback(null, path)
    const idDataCb = (path: any, _id: any, _data: any, _params: any, callback: DummyCallback) =>
      callback(null, path)
    const dataCb = (path: any, _data: any, _params: any, callback: DummyCallback) => {
      callback(null, path)
    }

    connection.once('create', dataCb)
    service.methods('customMethod')

    let res = await service.create(testData, {
      route: {
        slug: 'mySlug'
      }
    })

    assert.strictEqual(res, 'mySlug/todos')

    connection.once('get', idCb)
    res = await service.get(1, {
      route: {
        slug: 'mySlug'
      }
    })
    assert.strictEqual(res, 'mySlug/todos')

    connection.once('remove', idCb)
    res = await service.remove(12, {
      route: {
        slug: 'mySlug'
      }
    })
    assert.strictEqual(res, 'mySlug/todos')

    connection.once('update', idDataCb)
    res = await service.update(12, testData, {
      route: {
        slug: 'mySlug'
      }
    })
    assert.strictEqual(res, 'mySlug/todos')

    connection.once('patch', idDataCb)
    res = await service.patch(12, testData, {
      route: {
        slug: 'mySlug'
      }
    })
    assert.strictEqual(res, 'mySlug/todos')

    connection.once('customMethod', dataCb)
    res = await service.customMethod(
      { message: 'test' },
      {
        route: {
          slug: 'mySlug'
        }
      }
    )
    assert.strictEqual(res, 'mySlug/todos')

    connection.once('find', (path: any, _params: any, callback: DummyCallback) => callback(null, path))

    res = await service.find({
      query: { test: true },
      route: {
        slug: 'mySlug'
      }
    })
    assert.strictEqual(res, 'mySlug/todos')
  })

  it('converts to feathers-errors (#19)', async () => {
    connection.once('create', (_path: any, _data: any, _params: any, callback: DummyCallback) =>
      callback(new NotAuthenticated('Test', { hi: 'me' }).toJSON())
    )

    await assert.rejects(() => service.create(testData), {
      name: 'NotAuthenticated',
      message: 'Test',
      code: 401,
      data: { hi: 'me' }
    })
  })

  it('converts other errors (#19)', async () => {
    connection.once('create', (_path: string, _data: any, _params: any, callback: (x: string) => void) => {
      callback('Something went wrong') // eslint-disable-line
    })

    await assert.rejects(() => service.create(testData), {
      message: 'Something went wrong'
    })
  })

  it('has all EventEmitter methods', (done) => {
    const testing = { hello: 'world' }
    const callback = (data: any) => {
      assert.deepStrictEqual(data, testing)
      assert.strictEqual(service.listenerCount('test'), 1)
      service.removeListener('test', callback)
      assert.strictEqual(service.listenerCount('test'), 0)
      done()
    }

    service.addListener('test', callback)

    connection.emit('todos test', testing)
  })

  it('properly handles on/off methods', (done) => {
    const testing = { hello: 'world' }

    const callback1 = (data: any) => {
      assert.deepStrictEqual(data, testing)
      assert.strictEqual(service.listenerCount('test'), 3)
      service.off('test', callback1)
      assert.strictEqual(service.listenerCount('test'), 2)
      service.removeAllListeners('test')
      assert.strictEqual(service.listenerCount('test'), 0)
      done()
    }
    const callback2 = () => {
      // noop
    }

    service.on('test', callback1)
    service.on('test', callback2)
    service.on('test', callback2)

    connection.emit('todos test', testing)
  })

  it('forwards namespaced call to .off, returns service instance', () => {
    // Use it's own connection and service so off method gets detected
    const conn = new EventEmitter()

    // @ts-ignore
    conn.off = function (name) {
      assert.strictEqual(name, 'todos test')

      return this
    }

    const client = new Service({
      name: 'todos',
      method: 'emit',
      connection: conn
    })

    assert.strictEqual(client.off('test'), client)
  })
})
