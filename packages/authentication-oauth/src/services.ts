import { Application, HookContext, NextFunction, Params } from '@feathersjs/feathers'
import { GrantConfig } from 'grant'
//@ts-ignore
import Grant from 'grant/lib/grant'
import { createDebug } from '@feathersjs/commons'
import { OAuthStrategy } from './strategy'
import { OauthSetupSettings } from './utils'

const debug = createDebug('@feathersjs/authentication-oauth/services')

export type OAuthParams = Omit<Params, 'route'> & {
  session: any
  state: Record<string, any>
  route: {
    provider: string
  }
}

export const locationHook = () => async (context: HookContext, next: NextFunction) => {
  await next()

  const { location } = context.result

  if (location) {
    context.http = {
      ...context.http,
      location
    }
  }
}

export class OAuthFlowService {
  grant: any

  constructor(opts: GrantConfig) {
    this.grant = Grant({ config: opts })
  }

  async handler(method: string, params: OAuthParams, body?: any, override?: string) {
    const {
      session,
      state,
      query,
      route: { provider }
    } = params

    const result = await this.grant({
      params: { provider, override },
      state: state.grant,
      session: session.grant,
      query,
      method,
      body
    })

    // result = { location, session, state }
    session.grant = result.session
    state.grant = result.state

    return result
  }

  async find(params: OAuthParams) {
    const { session, query, headers } = params
    const { feathers_token, redirect, ...rest } = query

    if (feathers_token) {
      debug('Got feathers_token query parameter to link accounts', feathers_token)
      session.accessToken = feathers_token
    }

    session.redirect = redirect
    session.query = rest
    session.headers = headers

    return this.handler(
      'GET',
      {
        ...params,
        query: rest
      },
      {}
    )
  }

  async get(override: string, params: OAuthParams) {
    return this.handler('GET', params, {}, override)
  }

  async create(data: any, params: OAuthParams) {
    return this.handler('POST', params, data)
  }
}

export class OAuthService {
  constructor(public app: Application, public settings: OauthSetupSettings) {}

  async authenticate(params: OAuthParams) {
    const name = params.route.provider
    const config: GrantConfig = this.app.get('grant')
    const { linkStrategy, authService } = this.settings
    const { accessToken, grant, query = {}, redirect, headers } = params.session
    const service = this.app.defaultAuthentication(authService)
    const strategy = service.getStrategy(name) as OAuthStrategy
    const authParams = {
      ...params,
      authStrategies: [name],
      authentication: accessToken
        ? {
            strategy: linkStrategy,
            accessToken
          }
        : null,
      query,
      redirect,
      headers
    }

    const payload = config.defaults.transport === 'session' ? grant.response : params.query
    const authentication = {
      strategy: name,
      ...payload
    }

    debug(`Calling ${authService}.create authentication with strategy ${name}`)

    const authResult = await service.create(authentication, authParams)

    debug('Successful oAuth authentication, sending response')

    const location = await strategy.getRedirect(authResult, authParams)

    return {
      ...authResult,
      location
    }
  }

  async find(params: OAuthParams) {
    return this.authenticate(params)
  }
}
