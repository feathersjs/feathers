import assert from 'assert'
import { EventEmitter } from 'events'
import { feathers, Application, Id, Params } from '@feathersjs/feathers'

import { socket as commons, SocketOptions } from '../../src/socket'

class DummyService {
  async get(id: Id, params: Params) {
    return { id, params }
  }

  async create(data: any, params: Params) {
    return {
      ...data,
      params
    }
  }

  async custom(data: any, params: Params) {
    return {
      ...data,
      params,
      message: 'From custom method'
    }
  }
}

describe('@feathersjs/transport-commons', () => {
  let provider: EventEmitter
  let options: SocketOptions
  let app: Application
  let connection: any

  beforeEach(() => {
    connection = { testing: true }
    provider = new EventEmitter()

    options = {
      emit: 'emit',
      done: Promise.resolve(provider),
      socketMap: new WeakMap(),
      getParams() {
        return connection
      }
    }
    app = feathers()
      .configure(commons(options))
      .use('/myservice', new DummyService(), {
        methods: ['get', 'create', 'custom']
      })

    return options.done
  })

  it('`connection` event', () =>
    new Promise<void>((resolve) => {
      const socket = new EventEmitter()

      app.once('connection', (data) => {
        assert.strictEqual(connection, data)
        resolve()
      })

      provider.emit('connection', socket)
    }))

  describe('method name based socket events', () => {
    it('.get without params', () =>
      new Promise<void>((resolve, reject) => {
        const socket = new EventEmitter()

        provider.emit('connection', socket)

        socket.emit('get', 'myservice', 10, (error: any, result: any) => {
          try {
            assert.ok(!error)
            assert.deepStrictEqual(result, {
              id: 10,
              params: Object.assign(
                {
                  query: {},
                  route: {},
                  connection
                },
                connection
              )
            })
            resolve()
          } catch (error: any) {
            reject(error)
          }
        })
      }))

    it('method with invalid service name and arguments', () =>
      new Promise<void>((resolve) => {
        const socket = new EventEmitter()

        provider.emit('connection', socket)

        socket.emit('get', null, (error: any) => {
          assert.strictEqual(error.name, 'NotFound')
          assert.strictEqual(error.message, 'Invalid service path')
          resolve()
        })
      }))

    it('method with implicit toString errors properly', () =>
      new Promise<void>((resolve) => {
        const socket = new EventEmitter()

        provider.emit('connection', socket)

        socket.emit('get', { toString: '' }, (error: any) => {
          assert.strictEqual(error.name, 'NotFound')
          assert.strictEqual(error.message, 'Invalid service path')
          resolve()
        })
      }))

    it('.create with params', () =>
      new Promise<void>((resolve, reject) => {
        const socket = new EventEmitter()
        const data = {
          test: 'data'
        }

        provider.emit('connection', socket)

        socket.emit(
          'create',
          'myservice',
          data,
          {
            fromQuery: true
          },
          (error: any, result: any) => {
            try {
              const params = Object.assign(
                {
                  query: { fromQuery: true },
                  route: {},
                  connection
                },
                connection
              )

              assert.ok(!error)
              assert.deepStrictEqual(result, Object.assign({ params }, data))
              resolve()
            } catch (error: any) {
              reject(error)
            }
          }
        )
      }))

    it('custom method with params', () =>
      new Promise<void>((resolve, reject) => {
        const socket = new EventEmitter()
        const data = {
          test: 'data'
        }

        provider.emit('connection', socket)

        socket.emit(
          'custom',
          'myservice',
          data,
          {
            fromQuery: true
          },
          (error: any, result: any) => {
            try {
              const params = Object.assign(
                {
                  query: { fromQuery: true },
                  route: {},
                  connection
                },
                connection
              )

              assert.ok(!error)
              assert.deepStrictEqual(result, {
                ...data,
                params,
                message: 'From custom method'
              })
              resolve()
            } catch (error: any) {
              reject(error)
            }
          }
        )
      }))
  })
})
