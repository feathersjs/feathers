import qs from 'qs'
import type { Application, Query } from '../declarations.js'
import { FetchClient, ProxiedFetchClient } from './fetch.js'
import { sseClient, SseClientOptions } from './sse.js'
import { defaultServiceEvents } from '../service.js'

export * from './fetch.js'
export * from './types.js'
export * from './sse.js'

export type ClientOptions = {
  baseUrl?: string
  Service?: typeof FetchClient
  stringify?: (query: Query) => string
  sse?: string | SseClientOptions
}

export function fetchClient(connection: typeof fetch, options: ClientOptions = {}) {
  const { stringify = qs.stringify, baseUrl = '', Service = ProxiedFetchClient } = options
  const events = options.sse ? defaultServiceEvents : undefined
  const sseOptions = typeof options.sse === 'string' ? { path: options.sse } : options.sse
  const defaultService = function (name: string) {
    return new Service({ baseUrl, name, connection, stringify, events })
  }
  const initialize = (_app: Application) => {
    const app = _app as Application & { rest: typeof fetch }

    if (app.rest !== undefined) {
      throw new Error('Only one default client provider can be configured')
    }

    app.rest = connection
    app.defaultService = defaultService

    if (sseOptions) {
      app.configure(sseClient(sseOptions))
    }
  }

  initialize.Service = Service
  initialize.service = defaultService

  return initialize
}
