import { Application, getServiceOptions, Params, RealTimeConnection } from '@feathersjs/feathers'
import { channels } from '../channels'
import { routing } from '../routing'
import { getDispatcher, runMethod } from './utils'

export interface SocketOptions {
  done: Promise<any>
  emit: string
  socketMap: WeakMap<RealTimeConnection, any>
  socketKey?: any
  getParams: (socket: any) => RealTimeConnection
}

export function socket({ done, emit, socketMap, socketKey, getParams }: SocketOptions) {
  return (app: Application) => {
    const leaveChannels = (connection: RealTimeConnection) => {
      const { channels } = app

      if (channels.length) {
        app.channel(app.channels).leave(connection)
      }
    }

    app.configure(channels())
    app.configure(routing())

    app.on('publish', getDispatcher(emit, socketMap, socketKey))
    app.on('disconnect', leaveChannels)
    app.on('logout', (_authResult: any, params: Params) => {
      const { connection } = params

      if (connection) {
        leaveChannels(connection)
      }
    })

    // `connection` event
    done.then((provider) =>
      provider.on('connection', (connection: any) => app.emit('connection', getParams(connection)))
    )

    // `socket.emit('methodName', 'serviceName', ...args)` handlers
    done.then((provider) =>
      provider.on('connection', (connection: any) => {
        const methodHandlers = Object.keys(app.services).reduce((result, name) => {
          const { methods } = getServiceOptions(app.service(name))

          methods.forEach((method) => {
            if (!result[method]) {
              result[method] = (...args: any[]) => {
                const [path, ...rest] = args

                runMethod(app, getParams(connection), path, method, rest)
              }
            }
          })

          return result
        }, {} as any)

        Object.keys(methodHandlers).forEach((key) => connection.on(key, methodHandlers[key]))
      })
    )
  }
}
