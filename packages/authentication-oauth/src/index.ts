import { Application } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
import { resolveDispatch } from '@feathersjs/schema'

import { OAuthStrategy, OAuthProfile } from './strategy'
import { redirectHook, OAuthService, OAuthCallbackService } from './service'
import { getGrantConfig, authenticationServiceOptions, OauthSetupSettings } from './utils'

const debug = createDebug('@feathersjs/authentication-oauth')

export { OauthSetupSettings, OAuthStrategy, OAuthProfile, OAuthService }

export const oauth =
  (settings: Partial<OauthSetupSettings> = {}) =>
  (app: Application) => {
    const authService = app.defaultAuthentication ? app.defaultAuthentication(settings.authService) : null

    if (!authService) {
      throw new Error(
        'An authentication service must exist before registering @feathersjs/authentication-oauth'
      )
    }

    if (!authService.configuration.oauth) {
      debug('No oauth configuration found in authentication configuration. Skipping oAuth setup.')
      return
    }

    const oauthOptions = {
      linkStrategy: 'jwt',
      ...settings
    }

    const grantConfig = getGrantConfig(authService)
    const serviceOptions = authenticationServiceOptions(authService, oauthOptions)
    const servicePath = `${grantConfig.defaults.prefix || 'oauth'}/:provider`
    const callbackServicePath = `${servicePath}/callback`
    const oauthService = new OAuthService(authService, oauthOptions)

    app.use(servicePath, oauthService, serviceOptions)
    app.use(callbackServicePath, new OAuthCallbackService(oauthService), serviceOptions)
    app.service(servicePath).hooks({
      around: { all: [resolveDispatch(), redirectHook()] }
    })
    app.service(callbackServicePath).hooks({
      around: { all: [resolveDispatch(), redirectHook()] }
    })

    if (typeof app.service(servicePath).publish === 'function') {
      app.service(servicePath).publish(() => null)
    }

    if (typeof app.service(callbackServicePath).publish === 'function') {
      app.service(callbackServicePath).publish(() => null)
    }
  }
