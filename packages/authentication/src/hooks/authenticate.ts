import { HookContext, NextFunction } from '@feathersjs/feathers'
import { NotAuthenticated } from '@feathersjs/errors'
import { createDebug } from '@feathersjs/commons'

const debug = createDebug('@feathersjs/authentication/hooks/authenticate')

export interface AuthenticateHookSettings {
  service?: string
  strategies?: string[]
}

export default (originalSettings: string | AuthenticateHookSettings, ...originalStrategies: string[]) => {
  const settings =
    typeof originalSettings === 'string'
      ? { strategies: [originalSettings, ...originalStrategies] }
      : originalSettings

  if (!originalSettings || settings.strategies.length === 0) {
    throw new Error('The authenticate hook needs at least one allowed strategy')
  }

  return async (context: HookContext, _next?: NextFunction) => {
    const next = typeof _next === 'function' ? _next : async () => context
    const { app, params, type, path, service } = context
    const { strategies } = settings
    const { provider, authentication } = params
    const authService = app.defaultAuthentication(settings.service)

    debug(`Running authenticate hook on '${path}'`)

    if (type && type !== 'before' && type !== 'around') {
      throw new NotAuthenticated('The authenticate hook must be used as a before hook')
    }

    if (!authService || typeof authService.authenticate !== 'function') {
      throw new NotAuthenticated('Could not find a valid authentication service')
    }

    if (service === authService) {
      throw new NotAuthenticated(
        'The authenticate hook does not need to be used on the authentication service'
      )
    }

    if (params.authenticated === true) {
      return next()
    }

    if (authentication) {
      const { provider, authentication, ...authParams } = params

      debug('Authenticating with', authentication, strategies)

      const authResult = await authService.authenticate(authentication, authParams, ...strategies)

      const { accessToken, ...authResultWithoutToken } = authResult

      context.params = {
        ...params,
        ...authResultWithoutToken,
        authenticated: true
      }
    } else if (provider) {
      throw new NotAuthenticated('Not authenticated')
    }

    return next()
  }
}
