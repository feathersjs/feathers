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
import { Service } from '@feathersjs/tests'
import { Socket } from 'socket.io-client'

import methodTests from './methods'
import eventTests from './events'
import socketio from '../src/index'
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

  before((done) => {
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

    app
      .listen(7886)
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
      .catch(done)

    socket = io('http://localhost:7886')
    socket.on('connect', () => done())
  })

  after((done) => {
    socket.disconnect()
    server.close(done)
  })

  it('runs io before setup (#131)', (done) => {
    let counter = 0
    const app = feathers().configure(
      socketio(() => {
        assert.strictEqual(counter, 0)
        counter++
      })
    )

    app.listen(8887).then((srv) => {
      srv.on('listening', () => srv.close(done))
    })
  })

  it('can set MaxListeners', (done) => {
    const app = feathers().configure(socketio((io) => io.sockets.setMaxListeners(100)))

    app.listen(8987).then((srv) => {
      srv.on('listening', () => {
        assert.strictEqual(app.io.sockets.getMaxListeners(), 100)
        srv.close(done)
      })
    })
  })

  it('expressified app works', async () => {
    const data = { message: 'Hello world' }
    const app = express(feathers())
      .configure(socketio())
      .use('/test', (_req: Request, res: Response) => res.json(data))

    const srv = await app.listen(8992)
    const response = await axios({
      url: 'http://localhost:8992/socket.io/socket.io.js'
    })

    assert.strictEqual(response.status, 200)

    const res = await axios({
      url: 'http://localhost:8992/test'
    })

    assert.deepStrictEqual(res.data, data)

    await new Promise((resolve) => srv.close(() => resolve(srv)))
  })

  it('can set options (#12)', (done) => {
    const application = feathers().configure(
      socketio(
        {
          path: '/test/'
        },
        (ioInstance) => assert.ok(ioInstance)
      )
    )

    application.listen(8987).then((srv) => {
      srv.on('listening', async () => {
        const { status } = await axios('http://localhost:8987/test/socket.io.js')

        assert.strictEqual(status, 200)
        srv.close(done)
      })
    })
  })

  it('passes handshake as service parameters', (done) => {
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
          done()
        }
      )
    })
  })

  it('connection and disconnect events (#1243, #1238)', (done) => {
    const mySocket = io('http://localhost:7886?channel=dctest')

    app.once('connection', (connection) => {
      assert.strictEqual(connection.channel, 'dctest')
      app.once('disconnect', (disconnection) => {
        assert.strictEqual(disconnection.channel, 'dctest')
        done()
      })
      setTimeout(() => mySocket.close(), 100)
    })

    assert.ok(mySocket)
  })

  it('app `disconnect` event disconnects socket (#2754)', (done) => {
    const mySocket = io('http://localhost:7886?channel=dctest')

    app.once('connection', (connection) => {
      assert.strictEqual(connection.channel, 'dctest')
      mySocket.once('disconnect', () => done())
      app.emit('disconnect', connection)
    })

    assert.ok(mySocket)
  })

  it('missing parameters in socket call works (#88)', (done) => {
    socket.emit('find', 'verify', (error: any, data: any) => {
      assert.ok(!error)
      assert.deepStrictEqual(
        omit(data.params, 'query', 'route', 'connection'),
        socketParams,
        'Handshake parameters passed on proper position'
      )
      done()
    })
  })

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
