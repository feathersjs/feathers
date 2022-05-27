import { Application, HookContext } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
import { authenticate as AuthenticateHook } from '@feathersjs/authentication'

import { Middleware } from './declarations'

const debug = createDebug('@feathersjs/koa/authentication')

export type AuthenticationSettings = {
  service?: string
  strategies?: string[]
}

export function parseAuthentication(settings: AuthenticationSettings = {}): Middleware {
  return async (ctx, next) => {
    const app = ctx.app
    const service = app.defaultAuthentication?.(settings.service)

    if (!service) {
      return next()
    }

    const config = service.configuration
    const authStrategies = settings.strategies || config.parseStrategies || config.authStrategies || []

    if (authStrategies.length === 0) {
      debug('No `authStrategies` or `parseStrategies` found in authentication configuration')
      return next()
    }

    const authentication = await service.parse(ctx.req, ctx.res, ...authStrategies)

    if (authentication) {
      debug('Parsed authentication from HTTP header', authentication)
      ctx.feathers = { ...ctx.feathers, authentication }
    }

    return next()
  }
}

export function authenticate(settings: string | AuthenticationSettings, ...strategies: string[]): Middleware {
  const hook = AuthenticateHook(settings, ...strategies)

  return async (ctx, next) => {
    const app = ctx.app as Application
    const params = ctx.feathers
    const context = { app, params } as HookContext

    await hook(context)

    ctx.feathers = context.params

    return next()
  }
}
