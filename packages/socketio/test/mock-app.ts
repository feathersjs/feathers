import { strict as assert } from 'assert'
import {
  feathers,
  HookContext,
  NullableId,
  Params,
  ApplicationHookContext,
  RealTimeConnection
} from '@feathersjs/feathers'
import { io } from 'socket.io-client'
import { Service } from '@feathersjs/tests-vitest'
import getPort from 'get-port'

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

export default async () => {
  const userName = 'David'

  const socketParams: any = {
    user: { name: userName },
    provider: 'socketio'
  }

  const errorHook = (hook: HookContext) => {
    if (hook.params.query.hookError) {
      throw new Error(`Error from ${hook.method}, ${hook.type} hook`)
    }
  }

  const app = feathers()
    .configure(
      socketio((io) => {
        io.use(function (socket: FeathersSocket, next: NextFunction) {
          socket.feathers.user = { name: userName }
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

  const server = await app.listen(port)

  await new Promise<void>((resolve) => {
    server.once('listening', () => {
      app.use('/tasks', new Service())
      app.service('tasks').hooks({
        before: {
          get: errorHook
        }
      })
      resolve()
    })
  })

  const socket = io(`http://localhost:${port}`)

  const pSocketConnected = new Promise<void>((resolve) => socket.on('connect', () => resolve()))

  let connection: RealTimeConnection

  const pAppConnection = new Promise<void>((resolve) => {
    app.once('connection', (conn) => {
      connection = conn
      app.channel('default').join(conn)
      app.publish(() => app.channel('default'))
      resolve()
    })
  })

  await Promise.all([pSocketConnected, pAppConnection])

  const pServerClosed = new Promise<void>((resolve) => server.once('close', () => resolve()))

  async function close() {
    socket.disconnect()
    server.closeAllConnections()
    server.close()
    await pServerClosed
  }

  return {
    app,
    socket,
    server,
    port,
    socketParams,
    connection,
    close
  }
}
