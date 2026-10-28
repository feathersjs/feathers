import { createDebug } from '@feathersjs/commons'
import { HookContext, NextFunction, Params } from '@feathersjs/feathers'
import { FeathersError, GeneralError, NotAuthenticated } from '@feathersjs/errors'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Grant from 'grant/lib/grant'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import grantConfig from 'grant/lib/config'
import { AuthenticationService } from '@feathersjs/authentication'
import { OAuthStrategy } from './strategy'
import { getAppleProfile } from './apple'
import { filterDynamic, getGrantConfig, OauthSetupSettings } from './utils'

const debug = createDebug('@feathersjs/authentication-oauth/services')

const isValue = (value: any) => typeof value === 'string' && value !== ''

/**
 * Grant treats a callback without an authorization code (OAuth2) or token (OAuth1) as a
 * successful response and exchanges the code with the provider the flow was started with.
 *
 * @throws NotAuthenticated if the callback is for a different provider or has no code or token
 */
function validateCallback(provider: any, params: OAuthParams) {
  const { query = {}, session, state, route } = params
  const input = Object.keys(query).length ? query : state?.oauthCallback || {}

  if (session.grant?.provider && session.grant.provider !== route.provider) {
    throw new NotAuthenticated('Invalid oAuth callback provider.')
  }

  if (input.error) {
    return
  }

  if (provider.oauth === 2 && !isValue(input.code)) {
    throw new NotAuthenticated('Missing oAuth authorization code.')
  }

  // Some OAuth1 providers store the request token code in the session instead
  if (provider.oauth === 1 && !isValue(input.oauth_token) && !session.grant?.request?.code) {
    throw new NotAuthenticated('Missing oAuth token.')
  }
}

export type GrantResponse = {
  location: string
  session: any
  state: any
}

export type OAuthParams = Omit<Params, 'route'> & {
  session: any
  state: Record<string, any>
  route: {
    provider: string
  }
}

export class OAuthError extends FeathersError {
  constructor(
    message: string,
    data: any,
    public location: string
  ) {
    super(message, 'NotAuthenticated', 401, 'not-authenticated', data)
  }
}

export const redirectHook = () => async (context: HookContext, next: NextFunction) => {
  try {
    await next()

    const { location } = context.result

    debug(`oAuth redirect to ${location}`)

    if (location) {
      context.http = {
        ...context.http,
        location
      }
    }
  } catch (error: any) {
    if (error.location) {
      context.http = {
        ...context.http,
        location: error.location
      }
      context.result = typeof error.toJSON === 'function' ? error.toJSON() : error
    } else {
      throw error
    }
  }
}

export class OAuthService {
  grant: any

  constructor(
    public service: AuthenticationService,
    public settings: OauthSetupSettings
  ) {
    const config = getGrantConfig(service)

    this.grant = Grant({ config })
  }

  async handler(method: string, params: OAuthParams, body?: any, override?: string): Promise<GrantResponse> {
    const {
      session,
      state,
      query,
      route: { provider }
    } = params
    const isCallback = override === 'callback'
    // Only the request that starts the flow sets dynamic provider options
    const options = isCallback ? null : grantConfig.provider(this.grant.config, { provider, override })

    const result: GrantResponse = await this.grant({
      params: { provider, override },
      state: state.grant,
      session: session.grant,
      query: filterDynamic(options, query),
      method,
      body: filterDynamic(options, body)
    })

    session.grant = result.session
    state.grant = result.state

    if (isCallback) {
      // Grant passes a callback without a code through, so authenticate validates its input
      state.oauthCallback = method === 'POST' ? body : {}
    }

    return result
  }

  async authenticate(params: OAuthParams, result: GrantResponse) {
    const name = params.route.provider
    const { linkStrategy, authService } = this.settings
    const { accessToken, grant, headers, query = {}, redirect } = params.session
    const strategy = this.service.getStrategy(name) as OAuthStrategy
    const authParams = {
      ...params,
      headers,
      authStrategies: [name],
      authentication: accessToken
        ? {
            strategy: linkStrategy,
            accessToken
          }
        : null,
      query,
      redirect
    }

    const payload = grant?.response || result?.session?.response || result?.state?.response

    if (!payload) {
      throw new NotAuthenticated(
        'No valid oAuth response. You must initiate the oAuth flow from the authorize endpoint.'
      )
    }
    const authentication = {
      strategy: name,
      ...payload
    }

    try {
      const provider = grantConfig.provider(this.grant.config, grant || {}, params.state?.grant)

      validateCallback(provider, params)

      if (payload.error) {
        throw new GeneralError(payload.error_description || payload.error, payload)
      }

      if (provider.apple && !provider.profile_url && payload.profile) {
        authentication.profile = await getAppleProfile(payload, provider.key)
      }

      debug(`Calling ${authService}.create authentication with strategy ${name}`)

      const authResult = await this.service.create(authentication, authParams)

      debug('Successful oAuth authentication, sending response')

      const location = await strategy.getRedirect(authResult, authParams)

      if (typeof params.session.destroy === 'function') {
        await params.session.destroy()
      }

      return {
        ...authResult,
        location
      }
    } catch (error: any) {
      // The redirect itself can be invalid, the session still has to be destroyed
      const location = strategy ? await strategy.getRedirect(error, authParams).catch((): null => null) : null
      const e = new OAuthError(error.message, error.data, location)

      if (typeof params.session.destroy === 'function') {
        await params.session.destroy()
      }

      e.stack = error.stack
      throw e
    }
  }

  async find(params: OAuthParams) {
    const { session, query, headers } = params
    const { feathers_token, redirect, ...restQuery } = query
    const handlerParams = {
      ...params,
      query: restQuery
    }

    if (feathers_token) {
      debug('Got feathers_token query parameter to link accounts')
      const strategy = this.service.getStrategy(params.route.provider) as OAuthStrategy

      if (typeof strategy?.validateLink !== 'function') {
        throw new NotAuthenticated('Account linking is not supported for this provider.')
      }

      await strategy.validateLink(params)
      session.accessToken = feathers_token
    }

    session.redirect = redirect
    session.query = restQuery
    // Only store the referer header needed for origin validation
    session.headers = {
      referer: headers?.referer
    }

    return this.handler('GET', handlerParams, {})
  }

  async get(override: string, params: OAuthParams) {
    const result = await this.handler('GET', params, {}, override)

    return result
  }

  async create(data: any, params: OAuthParams) {
    return this.handler('POST', params, data)
  }
}

export class OAuthCallbackService {
  constructor(public service: OAuthService) {}

  async find(params: OAuthParams) {
    const result = await this.service.handler('GET', params, {}, 'callback')

    return this.service.authenticate(params, result)
  }

  async create(data: any, params: OAuthParams) {
    const result = await this.service.handler('POST', params, data, 'callback')

    return this.service.authenticate(params, result)
  }
}
