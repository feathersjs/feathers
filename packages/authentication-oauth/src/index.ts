import { Application } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
import { resolveDispatch } from '@feathersjs/schema'

import { OAuthStrategy, OAuthProfile } from './strategy'
import { redirectHook, OAuthService } from './service'
import { getGrantConfig, authenticationServiceOptions, OauthSetupSettings } from './utils'

const debug = createDebug('@feathersjs/authentication-oauth')

export { OauthSetupSettings, OAuthStrategy, OAuthProfile }

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

    app.use(servicePath, new OAuthService(authService, oauthOptions), serviceOptions)

    const oauthService = app.service(servicePath)

    oauthService.hooks({
      around: { all: [resolveDispatch(), redirectHook()] }
    })

    if (typeof oauthService.publish === 'function') {
      app.service(servicePath).publish(() => null)
    }
  }
