import { Application, defaultServiceMethods } from '@feathersjs/feathers'

import { Base } from './base'
import { AxiosClient } from './axios'
import { FetchClient } from './fetch'
import { SuperagentClient } from './superagent'

export { AxiosClient, FetchClient, SuperagentClient }

const transports = {
  superagent: SuperagentClient,
  fetch: FetchClient,
  axios: AxiosClient
}

interface HandlerResult extends Function {
  /**
   * initialize service
   */
  (): void

  /**
   * Transport Service
   */
  Service: any

  /**
   * default Service
   */
  service: any
}

export type Handler = (connection: any, options?: any, Service?: any) => HandlerResult

export interface Transport {
  superagent: Handler
  fetch: Handler
  axios: Handler
}

export type RestService<T = any, D = Partial<any>> = Base<T, D>

export default function restClient(base = '') {
  const result: any = { Base }

  Object.keys(transports).forEach((key) => {
    result[key] = function (connection: any, options: any = {}, Service: Base = (transports as any)[key]) {
      if (!connection) {
        throw new Error(`${key} has to be provided to feathers-rest`)
      }

      if (typeof options === 'function') {
        Service = options
        options = {}
      }

      const defaultService = function (name: string) {
        return new (Service as any)({ base, name, connection, options })
      }

      const initialize = (app: Application & { rest: any }) => {
        if (app.rest !== undefined) {
          throw new Error('Only one default client provider can be configured')
        }

        app.rest = connection
        app.defaultService = defaultService
        app.mixins.unshift((service, _location, options) => {
          if (options && options.methods && service instanceof Base) {
            const customMethods = options.methods.filter((name) => !defaultServiceMethods.includes(name))

            service.methods(...customMethods)
          }
        })
      }

      initialize.Service = Service
      initialize.service = defaultService

      return initialize
    }
  })

  return result as Transport
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(restClient, module.exports)
}
