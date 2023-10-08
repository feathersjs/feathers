import { createDebug } from '@feathersjs/commons'
import { HookContext, NextFunction, Params } from '@feathersjs/feathers'
import { FeathersError, GeneralError } from '@feathersjs/errors'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Grant from 'grant/lib/grant'
import { AuthenticationService } from '@feathersjs/authentication'
import { OAuthStrategy } from './strategy'
import { getGrantConfig, OauthSetupSettings } from './utils'

const debug = createDebug('@feathersjs/authentication-oauth/services')

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

    const result: GrantResponse = await this.grant({
      params: { provider, override },
      state: state.grant,
      session: session.grant,
      query,
      method,
      body
    })

    session.grant = result.session
    state.grant = result.state

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

    const payload = grant?.response || result?.session?.response || result?.state?.response || params.query
    const authentication = {
      strategy: name,
      ...payload
    }

    try {
      if (payload.error) {
        throw new GeneralError(payload.error_description || payload.error, payload)
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
      const location = await strategy.getRedirect(error, authParams)
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
      debug('Got feathers_token query parameter to link accounts', feathers_token)
      session.accessToken = feathers_token
    }

    session.redirect = redirect
    session.query = restQuery
    session.headers = headers

    return this.handler('GET', handlerParams, {})
  }

  async get(override: string, params: OAuthParams) {
    const result = await this.handler('GET', params, {}, override)

    if (override === 'callback') {
      return this.authenticate(params, result)
    }

    return result
  }

  async create(data: any, params: OAuthParams) {
    return this.handler('POST', params, data)
  }
}
