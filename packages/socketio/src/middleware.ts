import { Application, Params, RealTimeConnection } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
import { Socket } from 'socket.io'

const debug = createDebug('@feathersjs/socketio/middleware')

export type ParamsGetter = (socket: Socket) => any
export type NextFunction = (err?: any) => void
export interface FeathersSocket extends Socket {
  feathers?: Params & { [key: string]: any }
}

export const disconnect = (
  app: Application,
  getParams: ParamsGetter,
  socketMap: WeakMap<RealTimeConnection, FeathersSocket>
) => {
  app.on('disconnect', (connection: RealTimeConnection) => {
    const socket = socketMap.get(connection)
    if (socket && socket.connected) {
      socket.disconnect()
    }
  })

  return (socket: FeathersSocket, next: NextFunction) => {
    socket.on('disconnect', () => app.emit('disconnect', getParams(socket)))
    next()
  }
}

export const params =
  (_app: Application, socketMap: WeakMap<RealTimeConnection, FeathersSocket>) =>
  (socket: FeathersSocket, next: NextFunction) => {
    socket.feathers = {
      provider: 'socketio',
      headers: socket.handshake.headers
    }

    socketMap.set(socket.feathers, socket)

    next()
  }

export const authentication =
  (app: Application, getParams: ParamsGetter, settings: any = {}) =>
  (socket: FeathersSocket, next: NextFunction) => {
    const service = (app as any).defaultAuthentication
      ? (app as any).defaultAuthentication(settings.service)
      : null

    if (service === null) {
      return next()
    }

    const config = service.configuration
    const authStrategies = config.parseStrategies || config.authStrategies || []

    if (authStrategies.length === 0) {
      return next()
    }

    service
      .parse(socket.handshake, null, ...authStrategies)
      .then(async (authentication: any) => {
        if (authentication) {
          debug('Parsed authentication from HTTP header', authentication)
          socket.feathers.authentication = authentication
          await service.create(authentication, {
            provider: 'socketio',
            connection: getParams(socket)
          })
        }

        next()
      })
      .catch(next)
  }
