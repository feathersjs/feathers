import { Application, FeathersService, ServiceOptions } from '@feathersjs/feathers'
import { Router } from './router'

declare module '@feathersjs/feathers/lib/declarations' {
  interface RouteLookup {
    service: Service
    params: { [key: string]: any }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Application<Services, Settings> {
    // eslint-disable-line
    routes: Router<{
      service: Service
      params?: { [key: string]: any }
    }>
    lookup(path: string): RouteLookup
  }
}

export * from './router'

const lookup = function (this: Application, path: string) {
  const result = this.routes.lookup(path)

  if (result === null) {
    return null
  }

  const {
    params: colonParams,
    data: { service, params: dataParams }
  } = result

  const params = dataParams ? { ...dataParams, ...colonParams } : colonParams

  return { service, params }
}

export const routing = () => (app: Application) => {
  if (typeof app.lookup === 'function') {
    return
  }

  const { unuse } = app

  app.routes = new Router()
  app.lookup = lookup
  app.unuse = function (path: string) {
    app.routes.remove(path)
    app.routes.remove(`${path}/:__id`)
    return unuse.call(this, path)
  }

  // Add a mixin that registers a service on the router
  app.mixins.push((service: FeathersService, path: string, options: ServiceOptions) => {
    const { routeParams: params = {} } = options

    app.routes.insert(path, { service, params })
    app.routes.insert(`${path}/:__id`, { service, params })
  })
}
