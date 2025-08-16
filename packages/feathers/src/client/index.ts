import qs from 'qs'
import type { Application, Query } from '../declarations.js'
import { FetchClient, ProxiedFetchClient } from './fetch.js'

export * from './fetch.js'
export * from './types.js'
export * from './sse.js'

export type ClientOptions = {
  baseUrl?: string
  Service?: typeof FetchClient
  stringify?: (query: Query) => string
}

export function fetchClient(connection: typeof fetch, options: ClientOptions = {}) {
  const { stringify = qs.stringify, baseUrl = '', Service = ProxiedFetchClient } = options
  const defaultService = function (name: string) {
    return new Service({ baseUrl, name, connection, stringify })
  }

  const initialize = (_app: Application) => {
    const app = _app as Application & { rest: typeof fetch }

    if (app.rest !== undefined) {
      throw new Error('Only one default client provider can be configured')
    }

    app.rest = connection
    app.defaultService = defaultService
  }

  initialize.Service = Service
  initialize.service = defaultService

  return initialize
}
