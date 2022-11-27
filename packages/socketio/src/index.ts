import http from 'http'
import { Server, ServerOptions } from 'socket.io'
import { createDebug } from '@feathersjs/commons'
import { Application, RealTimeConnection } from '@feathersjs/feathers'
import { socket } from '@feathersjs/transport-commons'

import { disconnect, params, authentication, FeathersSocket } from './middleware'

const debug = createDebug('@feathersjs/socketio')

declare module '@feathersjs/feathers/lib/declarations' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Application<Services, Settings> {
    io: any
    listen(options: any): Promise<http.Server>
  }
}

function configureSocketio(callback?: (io: Server) => void): (app: Application) => void
function configureSocketio(
  options: number | Partial<ServerOptions>,
  callback?: (io: Server) => void
): (app: Application) => void
function configureSocketio(
  port: number,
  options?: Partial<ServerOptions>,
  callback?: (io: Server) => void
): (app: Application) => void
function configureSocketio(port?: any, options?: any, config?: any) {
  if (typeof port !== 'number') {
    config = options
    options = port
    port = null
  }

  if (typeof options !== 'object') {
    config = options
    options = {}
  }

  return (app: Application) => {
    // Function that gets the connection
    const getParams = (socket: FeathersSocket) => socket.feathers
    // A mapping from connection to socket instance
    const socketMap = new WeakMap<RealTimeConnection, FeathersSocket>()
    // Promise that resolves with the Socket.io `io` instance
    // when `setup` has been called (with a server)
    const done = new Promise((resolve) => {
      const { listen, setup } = app as any

      Object.assign(app, {
        async listen(this: any, ...args: any[]) {
          if (typeof listen === 'function') {
            // If `listen` already exists
            // usually the case when the app has been expressified
            return listen.call(this, ...args)
          }

          const server = http.createServer()

          await this.setup(server)

          return server.listen(...args)
        },

        async setup(this: any, server: http.Server, ...rest: any[]) {
          if (!this.io) {
            const io = (this.io = new Server(port || server, options))

            io.use(disconnect(app, getParams, socketMap))
            io.use(params(app, socketMap))
            io.use(authentication(app, getParams))

            // In Feathers it is easy to hit the standard Node warning limit
            // of event listeners (e.g. by registering 10 services).
            // So we set it to a higher number. 64 should be enough for everyone.
            io.sockets.setMaxListeners(64)
          }

          if (typeof config === 'function') {
            debug('Calling SocketIO configuration function')
            config.call(this, this.io)
          }

          resolve(this.io)

          return setup.call(this, server, ...rest)
        }
      })
    })

    app.configure(
      socket({
        done,
        socketMap,
        getParams,
        emit: 'emit'
      })
    )
  }
}

export = configureSocketio
