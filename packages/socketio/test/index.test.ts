import { strict as assert } from 'assert'
import {
  feathers,
  Application,
  HookContext,
  NullableId,
  Params,
  ApplicationHookContext
} from '@feathersjs/feathers'
import express from '@feathersjs/express'
import { Request, Response } from 'express'
import { omit, extend } from 'lodash'
import { io } from 'socket.io-client'
import axios from 'axios'
import { Server } from 'http'
import { Service } from '@feathersjs/tests-vitest'
import { Socket } from 'socket.io-client'
import getPort from 'get-port'

import methodTests from './methods'
import eventTests from './events'
import socketio from '../src'
import { FeathersSocket, NextFunction } from '../src/middleware.js'

class VerifierService {
  async find(params: Params) {
    return { params }
  }

  async create(data: any, params: Params) {
    return { data, params }
  }

  async update(id: NullableId, data: any, params: Params) {
    return { id, data, params }
  }
}

describe('@feathersjs/socketio', () => {
  let app: Application
  let server: Server
  let socket: Socket

  const socketParams: any = {
    user: { name: 'David' },
    provider: 'socketio'
  }
  const options = {
    get app() {
      return app
    },

    get socket() {
      return socket
    }
  }

  beforeAll(
    () =>
      new Promise<void>(async (resolve, reject) => {
        const errorHook = (hook: HookContext) => {
          if (hook.params.query.hookError) {
            throw new Error(`Error from ${hook.method}, ${hook.type} hook`)
          }
        }

        app = feathers()
          .configure(
            socketio((io) => {
              io.use(function (socket: FeathersSocket, next: NextFunction) {
                socket.feathers.user = { name: 'David' }
                socketParams.headers = socket.feathers.headers

                const { channel } = socket.handshake.query as any

                if (channel) {
                  socket.feathers.channel = channel
                }

                next()
              })
            })
          )
          .use('/todo', new Service())
          .use('/verify', new VerifierService())

        app.service('todo').hooks({
          before: {
            get: errorHook
          }
        })

        app.hooks({
          setup: [
            async (context: ApplicationHookContext, next: NextFunction) => {
              assert.notStrictEqual(context.app, undefined)
              await next()
            }
          ]
        })

        const port = await getPort()

        app
          .listen(port)
          .then((srv) => {
            server = srv
            server.once('listening', () => {
              app.use('/tasks', new Service())
              app.service('tasks').hooks({
                before: {
                  get: errorHook
                }
              })
            })
          })
          .catch(reject)

        socket = io(`http://localhost:${port}`)
        socket.on('connect', () => resolve())
      })
  )

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        socket.disconnect()
        server.close(() => resolve())
      })
  )

  it('runs io before setup (#131)', () =>
    new Promise<void>(async (resolve) => {
      let counter = 0
      const app = feathers().configure(
        socketio(() => {
          assert.strictEqual(counter, 0)
          counter++
        })
      )

      app.listen(await getPort()).then((srv) => {
        srv.on('listening', () => srv.close(() => resolve()))
      })
    }))

  it('can set MaxListeners', () =>
    new Promise<void>(async (resolve) => {
      const app = feathers().configure(socketio((io) => io.sockets.setMaxListeners(100)))

      app.listen(await getPort()).then((srv) => {
        srv.on('listening', () => {
          assert.strictEqual(app.io.sockets.getMaxListeners(), 100)
          srv.close(() => resolve())
        })
      })
    }))

  it('expressified app works', async () => {
    const data = { message: 'Hello world' }
    const app = express(feathers())
      .configure(socketio())
      .use('/test', (_req: Request, res: Response) => res.json(data))

    const port = await getPort()
    const srv = await app.listen(port)
    const response = await axios({
      url: `http://localhost:${port}/socket.io/socket.io.js`
    })

    assert.strictEqual(response.status, 200)

    const res = await axios({
      url: `http://localhost:${port}/test`
    })

    assert.deepStrictEqual(res.data, data)

    await new Promise((resolve) => srv.close(() => resolve(srv)))
  })

  it('can set options (#12)', () =>
    new Promise<void>(async (resolve) => {
      const application = feathers().configure(
        socketio(
          {
            path: '/test/'
          },
          (ioInstance) => assert.ok(ioInstance)
        )
      )

      const port = await getPort()

      application.listen(port).then((srv) => {
        srv.on('listening', async () => {
          const { status } = await axios(`http://localhost:${port}/test/socket.io.js`)

          assert.strictEqual(status, 200)
          srv.close(() => resolve())
        })
      })
    }))

  it('passes handshake as service parameters', () =>
    new Promise<void>((resolve) => {
      socket.emit('create', 'verify', {}, (error: any, data: any) => {
        assert.ok(!error)
        assert.deepStrictEqual(
          omit(data.params, 'query', 'route', 'connection'),
          socketParams,
          'Passed handshake parameters'
        )

        socket.emit(
          'update',
          'verify',
          1,
          {},
          {
            test: 'param'
          },
          (error: any, data: any) => {
            assert.ok(!error)
            assert.deepStrictEqual(
              data.params,
              extend(
                {
                  route: {},
                  connection: socketParams,
                  query: {
                    test: 'param'
                  }
                },
                socketParams
              ),
              'Passed handshake parameters as query'
            )
            resolve()
          }
        )
      })
    }))

  it('connection and disconnect events (#1243, #1238)', () =>
    new Promise<void>((resolve) => {
      const mySocket = io('http://localhost:7886?channel=dctest')

      app.once('connection', (connection) => {
        assert.strictEqual(connection.channel, 'dctest')
        app.once('disconnect', (disconnection) => {
          assert.strictEqual(disconnection.channel, 'dctest')
          resolve()
        })
        setTimeout(() => mySocket.close(), 100)
      })

      assert.ok(mySocket)
    }))

  it('app `disconnect` event disconnects socket (#2754)', () =>
    new Promise<void>((resolve) => {
      const mySocket = io('http://localhost:7886?channel=dctest')

      app.once('connection', (connection) => {
        assert.strictEqual(connection.channel, 'dctest')
        mySocket.once('disconnect', () => resolve())
        app.emit('disconnect', connection)
      })

      assert.ok(mySocket)
    }))

  it('missing parameters in socket call works (#88)', () =>
    new Promise<void>((resolve) => {
      socket.emit('find', 'verify', (error: any, data: any) => {
        assert.ok(!error)
        assert.deepStrictEqual(
          omit(data.params, 'query', 'route', 'connection'),
          socketParams,
          'Handshake parameters passed on proper position'
        )
        resolve()
      })
    }))

  describe('Service method calls', () => {
    describe("('method', 'service')  event format", () => {
      describe('Service', () => methodTests('todo', options))
      describe('Dynamic Service', () => methodTests('todo', options))
    })
  })

  describe('Service events', () => {
    describe('Service', () => eventTests('todo', options))
    describe('Dynamic Service', () => eventTests('tasks', options))
  })
})
