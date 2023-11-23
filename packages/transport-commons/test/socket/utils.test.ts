import assert from 'assert'
import { EventEmitter } from 'events'
import { feathers, Application, Params, RealTimeConnection } from '@feathersjs/feathers'
import { NotAuthenticated } from '@feathersjs/errors'
import { isPlainObject } from 'lodash'

import { routing } from '../../src/routing'
import { normalizeError, getDispatcher, runMethod } from '../../src/socket/utils'

describe('socket commons utils', () => {
  describe('.normalizeError', () => {
    it('simple error normalization', () => {
      const message = 'Something went wrong'
      const e = new Error(message)

      assert.deepStrictEqual(normalizeError(e), {
        message,
        stack: e.stack.toString()
      })
    })

    it('calls .toJSON', () => {
      const json = { message: 'toJSON called' }

      assert.deepStrictEqual(
        normalizeError({
          toJSON() {
            return json
          }
        }),
        json
      )
    })

    it('removes `hook` property', () => {
      const e = {
        hook: true
      }

      assert.deepStrictEqual(normalizeError(e), {})
      assert.ok(e.hook, 'Does not mutate the original object')
    })

    it('hides stack in production', () => {
      const oldEnv = process.env.NODE_ENV

      process.env.NODE_ENV = 'production'

      const message = 'Something went wrong'
      const e = new Error(message)
      const normalized = normalizeError(e)

      assert.strictEqual(normalized.message, message)
      assert.ok(!normalized.stack)

      process.env.NODE_ENV = oldEnv
    })
  })

  describe('.getDispatcher', () => {
    it('returns a dispatcher function', () =>
      assert.strictEqual(typeof getDispatcher('test', new WeakMap()), 'function'))

    it('works with backwards compatible socketKey', () =>
      new Promise<void>((resolve) => {
        const socketKey = Symbol('@feathersjs/test')
        const dispatcher = getDispatcher('emit', undefined, socketKey)
        const socket = new EventEmitter()
        const connection = {
          [socketKey]: socket
        }
        const channel: any = {
          connections: [connection],
          dataFor(): null {
            return null
          }
        }

        socket.once('testing', (data) => {
          assert.strictEqual(data, 'hi')
          resolve()
        })

        dispatcher('testing', channel, { result: 'hi' } as any)
      }))

    describe('dispatcher logic', () => {
      let dispatcher: any
      let dummySocket: EventEmitter
      let dummyHook: any
      let dummyChannel: any
      let dummyConnection: RealTimeConnection
      let dummyMap: WeakMap<any, any>

      beforeEach(() => {
        dummyConnection = {}
        dummyMap = new WeakMap()
        dispatcher = getDispatcher('emit', dummyMap)
        dummySocket = new EventEmitter()
        dummyHook = { result: 'hi' }
        dummyChannel = {
          connections: [dummyConnection],
          dataFor(): null {
            return null
          }
        }
        dummyMap.set(dummyConnection, dummySocket)
      })

      it('dispatches a basic event', () =>
        new Promise<void>((resolve) => {
          dummySocket.once('testing', (data) => {
            assert.strictEqual(data, 'hi')
            resolve()
          })

          dispatcher('testing', dummyChannel, dummyHook)
        }))

      it('dispatches event on a hooks path event', () =>
        new Promise<void>((resolve) => {
          dummyHook.path = 'myservice'

          dummySocket.once('myservice testing', (data) => {
            assert.strictEqual(data, 'hi')
            resolve()
          })

          dispatcher('testing', dummyChannel, dummyHook)
        }))

      it('dispatches `hook.dispatch` instead', () =>
        new Promise<void>((resolve) => {
          const message = 'hi from dispatch'

          dummyHook.dispatch = message

          dummySocket.once('testing', (data) => {
            assert.strictEqual(data, message)
            resolve()
          })

          dispatcher('testing', dummyChannel, dummyHook)
        }))

      it('does nothing if there is no socket', () => {
        dummyChannel.connections[0].test = null

        dispatcher('testing', dummyChannel, dummyHook)
      })

      it('dispatches arrays properly hook events', () =>
        new Promise<void>((resolve) => {
          const data1 = { message: 'First message' }
          const data2 = { message: 'Second message' }

          dummyHook.result = [data1, data2]

          dummySocket.once('testing', (data) => {
            assert.deepStrictEqual(data, data1)
            dummySocket.once('testing', (result) => {
              assert.deepStrictEqual(result, data2)
              resolve()
            })
          })

          dispatcher('testing', dummyChannel, dummyHook, data1)
          dispatcher('testing', dummyChannel, dummyHook, data2)
        }))

      it('dispatches dispatch arrays properly', () =>
        new Promise<void>((resolve) => {
          const data1 = { message: 'First message' }
          const data2 = { message: 'Second message' }

          dummyHook.result = []
          dummyHook.dispatch = [data1, data2]

          dummySocket.once('testing', (data) => {
            assert.deepStrictEqual(data, data1)
            dummySocket.once('testing', (result) => {
              assert.deepStrictEqual(result, data2)
              resolve()
            })
          })

          dispatcher('testing', dummyChannel, dummyHook, data1)
          dispatcher('testing', dummyChannel, dummyHook, data2)
        }))

      it('dispatches arrays properly for custom events', () =>
        new Promise<void>((resolve) => {
          const result = [{ message: 'First' }, { message: 'Second' }]

          dummyHook.result = result

          dummySocket.once('otherEvent', (data) => {
            assert.deepStrictEqual(data, result)
            resolve()
          })

          dispatcher('otherEvent', dummyChannel, dummyHook, result)
        }))
    })
  })

  describe('.runMethod', () => {
    let app: Application

    beforeEach(() => {
      app = feathers().configure(routing())
      app.use('/myservice', {
        async get(id: number | string, params: Params) {
          if (params.query.error) {
            throw new NotAuthenticated('None shall pass')
          }
          if (!isPlainObject(params.query)) {
            throw new Error('Query is not a plain object')
          }

          return { id }
        }
      })
    })

    describe('running methods', () => {
      it('basic', () =>
        new Promise<void>((resolve, reject) => {
          const callback = (error: any, result: any) => {
            if (error) {
              return reject(error)
            }

            assert.deepStrictEqual(result, { id: 10 })
            resolve()
          }

          runMethod(app, {}, 'myservice', 'get', [10, {}, callback])
        }))

      it('queries are always plain objects', () =>
        new Promise<void>((resolve, reject) => {
          const callback = (error: any, result: any) => {
            if (error) {
              return reject(error)
            }

            assert.deepStrictEqual(result, { id: 10 })
            resolve()
          }

          runMethod(app, {}, 'myservice', 'get', [
            10,
            {
              __proto__: []
            },
            callback
          ])
        }))

      it('merges params with connection and passes connection', () =>
        new Promise<void>((resolve, reject) => {
          const connection = {
            testing: true
          }
          const callback = (error: any, result: any) => {
            if (error) {
              return reject(error)
            }

            assert.deepStrictEqual(result, {
              id: 10,
              params: {
                connection,
                query: {},
                route: {},
                testing: true
              }
            })
            resolve()
          }

          app.use('/otherservice', {
            get(id, params) {
              return Promise.resolve({ id, params })
            }
          })

          runMethod(app, connection, 'otherservice', 'get', [10, {}, callback])
        }))

      it('with params missing', () =>
        new Promise<void>((resolve, reject) => {
          const callback = (error: any, result: any) => {
            if (error) {
              return reject(error)
            }

            assert.deepStrictEqual(result, { id: 10 })
            resolve()
          }

          runMethod(app, {}, 'myservice', 'get', [10, callback])
        }))

      it('with params but missing callback', () =>
        new Promise<void>((resolve) => {
          app.use('/otherservice', {
            get(id: number | string) {
              assert.strictEqual(id, 'dishes')

              return Promise.resolve({ id }).then((res) => {
                resolve()
                return res
              })
            }
          })

          runMethod(app, {}, 'otherservice', 'get', ['dishes', {}])
        }))

      it('with params and callback missing', () =>
        new Promise<void>((resolve) => {
          app.use('/otherservice', {
            get(id: number | string) {
              assert.strictEqual(id, 'laundry')

              return Promise.resolve({ id }).then((res) => {
                resolve()
                return res
              })
            }
          })

          runMethod(app, {}, 'otherservice', 'get', ['laundry'])
        }))
    })

    it('throws NotFound for invalid service', () =>
      new Promise<void>((resolve, reject) => {
        const callback = (error: any) => {
          try {
            assert.deepStrictEqual(error, {
              name: 'NotFound',
              message: "Service 'ohmyservice' not found",
              code: 404,
              className: 'not-found'
            })
            resolve()
          } catch (err: any) {
            reject(err)
          }
        }

        runMethod(app, {}, 'ohmyservice', 'get', [10, callback])
      }))

    it('throws MethodNotAllowed undefined method', () =>
      new Promise<void>((resolve, reject) => {
        const callback = (error: any) => {
          try {
            assert.deepStrictEqual(error, {
              name: 'MethodNotAllowed',
              message: "Method 'create' not allowed on service 'myservice'",
              code: 405,
              className: 'method-not-allowed'
            })
            resolve()
          } catch (error: any) {
            reject(error)
          }
        }

        runMethod(app, {}, 'myservice', 'create', [{}, callback])
      }))

    it('throws MethodNotAllowed for invalid service method', () =>
      new Promise<void>((resolve, reject) => {
        const callback = (error: any) => {
          try {
            assert.deepStrictEqual(error, {
              name: 'MethodNotAllowed',
              message: "Method 'blabla' not allowed on service 'myservice'",
              code: 405,
              className: 'method-not-allowed'
            })
            resolve()
          } catch (error: any) {
            reject(error)
          }
        }

        runMethod(app, {}, 'myservice', 'blabla', [{}, callback])
      }))

    it('method error calls back with normalized error', () =>
      new Promise<void>((resolve, reject) => {
        const callback = (error: any) => {
          try {
            assert.deepStrictEqual(error, {
              name: 'NotAuthenticated',
              message: 'None shall pass',
              code: 401,
              className: 'not-authenticated'
            })
            resolve()
          } catch (error: any) {
            reject(error)
          }
        }

        runMethod(app, {}, 'myservice', 'get', [42, { error: true }, callback])
      }))
  })
})
