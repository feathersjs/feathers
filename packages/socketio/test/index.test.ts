import { strict as assert } from 'assert'
import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'
import { Request, Response } from 'express'
import omit from 'lodash/omit.js'
import { io } from 'socket.io-client'
import axios from 'axios'
import getPort from 'get-port'

import socketio from '../src'
import mockApp from './mock-app'

describe('@feathersjs/socketio', async () => {
  const { app, socket, port, socketParams, close } = await mockApp()

  afterAll(async () => {
    await close()
  })

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
              {
                route: {},
                connection: {
                  ...socketParams
                },
                query: {
                  test: 'param'
                },
                ...socketParams
              },
              'Passed handshake parameters as query'
            )
            resolve()
          }
        )
      })
    }))

  it('connection and disconnect events (#1243, #1238)', () =>
    new Promise<void>((resolve) => {
      const mySocket = io(`http://localhost:${port}?channel=dctest`)

      app.once('connection', (connection) => {
        assert.strictEqual(connection.channel, 'dctest')
        app.once('disconnect', (disconnection) => {
          assert.strictEqual(disconnection.channel, 'dctest')
          resolve()
        })
        mySocket.close()
      })

      assert.ok(mySocket)
    }))

  it('app `disconnect` event disconnects socket (#2754)', () =>
    new Promise<void>((resolve) => {
      const mySocket = io(`http://localhost:${port}?channel=dctest`)

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
})
