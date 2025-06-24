import { Application } from '../declarations'
import { FetchClient } from './fetch.js'

export function fetchClient(connection: typeof fetch, base = '') {
  const defaultService = function (name: string) {
    return new FetchClient({ base, name, connection, options: {} })
  }

  const initialize = (_app: Application) => {
    const app = _app as Application & { rest: typeof fetch }

    if (app.rest !== undefined) {
      throw new Error('Only one default client provider can be configured')
    }

    app.rest = connection
    app.defaultService = defaultService
  }

  initialize.Service = FetchClient
  initialize.service = defaultService

  return initialize
}
