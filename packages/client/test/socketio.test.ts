import { io } from 'socket.io-client'
import socketio from '@feathersjs/socketio'
import { Server } from 'http'
import { clientTests } from '@feathersjs/tests'

import * as feathers from '../dist/feathers'
import app from './fixture'
import getPort from 'get-port'

describe('Socket.io connector', async function () {
  let server: Server
  const port = await getPort()
  const socket = io(`http://localhost:${port}`)
  const client = feathers.default().configure(feathers.socketio(socket))

  beforeAll(async () => {
    server = await app((app) => app.configure(socketio())).listen(port)
  })

  afterAll(
    () =>
      new Promise<void>((done) => {
        socket.once('disconnect', () => {
          server.close()
          done()
        })
        socket.disconnect()
      })
  )

  clientTests(client, 'todos')
})
