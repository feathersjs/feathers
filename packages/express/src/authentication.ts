import { RequestHandler, Request, Response } from 'express'
import { HookContext } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
import { authenticate as AuthenticateHook } from '@feathersjs/authentication'

import { Application } from './declarations'

const debug = createDebug('@feathersjs/express/authentication')

const toHandler = (
  func: (req: Request, res: Response, next: () => void) => Promise<void>
): RequestHandler => {
  return (req, res, next) => func(req, res, next).catch((error) => next(error))
}

export type AuthenticationSettings = {
  service?: string
  strategies?: string[]
}

export function parseAuthentication(settings: AuthenticationSettings = {}): RequestHandler {
  return toHandler(async (req, res, next) => {
    const app = req.app as any as Application
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

    const authentication = await service.parse(req, res, ...authStrategies)

    if (authentication) {
      debug('Parsed authentication from HTTP header', authentication)
      req.feathers = { ...req.feathers, authentication }
    }

    return next()
  })
}

export function authenticate(
  settings: string | AuthenticationSettings,
  ...strategies: string[]
): RequestHandler {
  const hook = AuthenticateHook(settings, ...strategies)

  return toHandler(async (req, _res, next) => {
    const app = req.app as any as Application
    const params = req.feathers
    const context = { app, params } as any as HookContext

    await hook(context)

    req.feathers = context.params

    return next()
  })
}
