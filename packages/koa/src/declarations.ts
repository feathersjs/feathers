import Koa, { Next } from 'koa'
import { Server } from 'http'
import { Application as FeathersApplication, HookContext, Params } from '@feathersjs/feathers'
import { RouteLookup } from '@feathersjs/transport-commons'

import '@feathersjs/authentication'

export type ApplicationAddons = {
  server: Server
  listen(port?: number, ...args: any[]): Promise<Server>
}

export type Application<T = any, C = any> = Omit<Koa, 'listen'> &
  FeathersApplication<T, C> &
  ApplicationAddons

export type FeathersKoaContext<A = Application> = Koa.Context & {
  app: A
}

export type Middleware<A = Application> = (context: FeathersKoaContext<A>, next: Next) => any

declare module '@feathersjs/feathers' {
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
