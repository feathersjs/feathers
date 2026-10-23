import type { RequestHandler } from 'express'
import type { Middleware, Application as KoaApplication } from '@feathersjs/koa'

import type { ServiceOptions } from '@feathersjs/feathers'

import '@feathersjs/koa'
import '@feathersjs/express'
import expressCookieSession from 'cookie-session'
import koaCookieSession from 'koa-session'

import { AuthenticationService } from '@feathersjs/authentication'
import { GrantConfig } from 'grant'

/**
 * Grant options a request must not override for providers with `dynamic: true`, since they
 * decide where tokens and profiles come from and how the response is checked.
 */
const PROTECTED_DYNAMIC_OPTIONS = [
  'request_url',
  'authorize_url',
  'access_url',
  'profile_url',
  'oauth',
  'origin',
  'prefix',
  'redirect_uri',
  'callback',
  'transport',
  'response',
  'key',
  'secret',
  'client_id',
  'client_secret',
  'consumer_key',
  'consumer_secret',
  'public_key',
  'private_key',
  'token_endpoint_auth_method',
  'token_endpoint_auth_signing_alg',
  'state',
  'nonce',
  'pkce',
  'subdomain',
  'name',
  'dynamic',
  'overrides'
]

/**
 * Authorization parameters `custom_params` must not replace, since Grant copies it over them.
 */
const PROTECTED_CUSTOM_PARAMS = [
  'client_id',
  'app_id',
  'appid',
  'client_key',
  'redirect_uri',
  'response_type',
  'state',
  'nonce',
  'code_challenge',
  'code_challenge_method'
]

const omit = (data: any, keys: string[]) =>
  Object.fromEntries(Object.entries(data).filter(([key]) => !keys.includes(key)))

export interface OauthSetupSettings {
  linkStrategy: string
  authService?: string
  expressSession?: RequestHandler
  koaSession?: Middleware
}

export const getGrantConfig = (service: AuthenticationService): GrantConfig => {
  const {
    app,
    configuration: { oauth }
  } = service
  // Set up all the defaults
  const port = app.get('port')
  let host = app.get('host')
  let protocol = 'https'

  // Development environments commonly run on HTTP with an extended port
  if (process.env.NODE_ENV !== 'production') {
    protocol = 'http'
    if (String(port) !== '80') {
      host += `:${port}`
    }
  }

  // omit 'redirect' and 'origins' from oauth
  const { redirect, origins, ...oauthConfig } = oauth

  const grant: GrantConfig = {
    ...oauthConfig,
    defaults: {
      prefix: '/oauth',
      origin: `${protocol}://${host}`,
      transport: 'state',
      response: ['tokens', 'raw', 'profile'],
      ...oauthConfig.defaults
    }
  }

  const getUrl = (url: string) => {
    const { defaults } = grant
    return `${defaults.origin}${defaults.prefix}/${url}`
  }

  // iterate over grant object with key and value
  for (const [name, value] of Object.entries(grant)) {
    if (name !== 'defaults') {
      value.redirect_uri = value.redirect_uri || getUrl(`${name}/callback`)
    }
  }

  return grant
}

/**
 * Remove protected options from the request data for providers (or overrides) that are
 * configured with `dynamic: true`. `options` is the provider configuration as resolved by Grant.
 */
export const filterDynamic = (options: any, data: any) => {
  if (options?.dynamic !== true || !data || typeof data !== 'object') {
    return data
  }

  const result = omit(data, PROTECTED_DYNAMIC_OPTIONS)

  if (result.custom_params && typeof result.custom_params === 'object') {
    result.custom_params = omit(result.custom_params, PROTECTED_CUSTOM_PARAMS)
  }

  return result
}

export const setExpressParams: RequestHandler = (req, res, next) => {
  req.session.destroy ||= () => {
    req.session = null
  }

  req.feathers = {
    ...req.feathers,
    session: req.session,
    state: res.locals
  }

  next()
}

export const setKoaParams: Middleware = async (ctx, next) => {
  ctx.session.destroy ||= () => {
    ctx.session = null
  }

  ctx.feathers = {
    ...ctx.feathers,
    session: ctx.session,
    state: ctx.state
  } as any

  await next()
}

export const authenticationServiceOptions = (
  service: AuthenticationService,
  settings: OauthSetupSettings
): ServiceOptions => {
  const { secret } = service.configuration
  const koaApp = service.app as KoaApplication

  if (koaApp.context) {
    koaApp.keys = [secret]

    const { koaSession = koaCookieSession({ key: 'feathers.oauth' }, koaApp as any) } = settings

    return {
      koa: {
        before: [koaSession, setKoaParams]
      }
    }
  }

  const {
    expressSession = expressCookieSession({
      name: 'feathers.oauth',
      keys: [secret]
    })
  } = settings

  return {
    express: {
      before: [expressSession, setExpressParams]
    }
  }
}
