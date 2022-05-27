import { io } from 'socket.io-client'
import socketio from '@feathersjs/socketio'
import { Server } from 'http'
import { clientTests } from '@feathersjs/tests'

import * as feathers from '../dist/feathers'
import app from './fixture'

describe('Socket.io connector', function () {
  let server: Server
  const socket = io('http://localhost:9988')
  const client = feathers.default().configure(feathers.socketio(socket))

  before(async () => {
    server = await app((app) => app.configure(socketio())).listen(9988)
  })

  after(function (done) {
    socket.once('disconnect', () => {
      server.close()
      done()
    })
    socket.disconnect()
  })

  clientTests(client, 'todos')
})
