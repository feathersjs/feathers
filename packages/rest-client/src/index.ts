import type { Application, TransportConnection } from '@feathersjs/feathers'
import { defaultServiceMethods } from '@feathersjs/feathers'
import { Base } from './base.js'
import { AxiosClient } from './axios.js'
import { FetchClient } from './fetch.js'
import { SuperagentClient } from './superagent.js'

export { AxiosClient, FetchClient, SuperagentClient }

const transports = {
  superagent: SuperagentClient,
  fetch: FetchClient,
  axios: AxiosClient
}

export type Handler<ServiceTypes> = (
  connection: any,
  options?: any,
  Service?: any
) => TransportConnection<ServiceTypes>

export interface Transport<ServiceTypes> {
  superagent: Handler<ServiceTypes>
  fetch: Handler<ServiceTypes>
  axios: Handler<ServiceTypes>
}

export type RestService<T = any, D = Partial<any>> = Base<T, D>

export default function restClient<ServiceTypes = any>(base = '') {
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

  return result as Transport<ServiceTypes>
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(restClient, module.exports)
}
