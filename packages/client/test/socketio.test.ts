import { io } from 'socket.io-client'
import socketio from '@feathersjs/socketio'
import { Server } from 'http'
import { clientTests } from '@feathersjs/tests-vitest'

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
      new Promise<void>((resolve) => {
        socket.once('disconnect', () => {
          server.close()
          resolve()
        })
        socket.disconnect()
      })
  )

  clientTests(client, 'todos')
})
