import Koa, { Next } from 'koa'
import { Server } from 'http'
import { FeathersApplication, HookContext, Params, RouteLookup } from '@feathersjs/feathers'
import '@feathersjs/authentication'

export type ApplicationAddons = {
  server: Server
  listen(port?: number, ...args: any[]): Promise<Server>
}

export type KoaApplication<T = any, C = any> = Omit<Koa, 'listen'> &
  FeathersApplication<T, C> &
  ApplicationAddons

/**
 * The combined Koa and Feathers application type.
 *
 * @deprecated Use the `Application` type from your apps 'declarations' instead to get
 * the correct service and configuration typings. To get this type,
 * use `import { KoaApplication } from '@feathersjs/koa'`.
 */
export type Application<T = any, C = any> = KoaApplication<T, C>

export type FeathersKoaContext<A = KoaApplication> = Koa.Context & {
  app: A
}

export type Middleware<A = KoaApplication> = (context: FeathersKoaContext<A>, next: Next) => any

declare module '@feathersjs/feathers/lib/declarations' {
  interface ServiceOptions {
    koa?: {
      before?: Middleware[]
      after?: Middleware[]
      composed?: Middleware
    }
  }
}

declare module 'koa' {
  interface ExtendableContext {
    feathers?: Partial<Params>
    lookup?: RouteLookup
    hook?: HookContext
  }
}
