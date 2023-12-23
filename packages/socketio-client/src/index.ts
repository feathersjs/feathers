import { Socket } from 'socket.io-client'
import {
  Application,
  TransportConnection,
  defaultEventMap,
  defaultServiceMethods
} from '@feathersjs/feathers'
import { Service, SocketService } from './client'

export { SocketService }

declare module '@feathersjs/feathers' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface FeathersApplication<Services, Settings> {
    /**
     * The Socket.io client instance. Usually does not need
     * to be accessed directly.
     */
    io?: Socket
  }
}

export default function socketioClient<Services = any>(connection: Socket, options?: any) {
  if (!connection) {
    throw new Error('Socket.io connection needs to be provided')
  }

  const defaultService = function (this: any, name: string) {
    const events = Object.values(defaultEventMap)
    const settings = Object.assign({}, options, {
      events,
      name,
      connection,
      method: 'emit'
    })

    return new Service(settings) as any
  }

  const initialize = function (app: Application<Services>) {
    if (app.io !== undefined) {
      throw new Error('Only one default client provider can be configured')
    }

    app.io = connection as any
    app.defaultService = defaultService
    app.mixins.unshift((service, _location, options) => {
      if (options && options.methods && service instanceof Service) {
        const customMethods = options.methods.filter((name) => !defaultServiceMethods.includes(name))

        service.methods(...customMethods)
      }
    })
  }

  initialize.Service = Service
  initialize.service = defaultService

  return initialize as TransportConnection<Services>
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(socketioClient, module.exports)
}
