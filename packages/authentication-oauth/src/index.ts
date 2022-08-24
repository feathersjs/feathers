import defaultsDeep from 'lodash/defaultsDeep'
import each from 'lodash/each'
import omit from 'lodash/omit'
import { createDebug } from '@feathersjs/commons'
import { Application, ServiceOptions } from '@feathersjs/feathers'
import { OAuthStrategy, OAuthProfile } from './strategy'
import { default as setupExpress } from './express'
import { OauthSetupSettings, getDefaultSettings } from './utils'
import { redirectHook, OAuthService } from './service'
import session from 'express-session'
import koaSession from 'koa-session'
import '@feathersjs/koa'
import { GrantConfig } from 'grant'

const debug = createDebug('@feathersjs/authentication-oauth')

export { OauthSetupSettings, OAuthStrategy, OAuthProfile }

export const setup = (options: OauthSetupSettings) => (app: Application) => {
  const service = app.defaultAuthentication ? app.defaultAuthentication(options.authService) : null

  if (!service) {
    throw new Error(
      'An authentication service must exist before registering @feathersjs/authentication-oauth'
    )
  }

  const { oauth } = service.configuration

  if (!oauth) {
    debug('No oauth configuration found in authentication configuration. Skipping oAuth setup.')
    return
  }

  const { strategyNames } = service

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

  const grant: GrantConfig = defaultsDeep({}, omit(oauth, ['redirect', 'origins']), {
    defaults: {
      prefix: '/oauth',
      origin: `${protocol}://${host}`,
      transport: 'state',
      response: ['tokens', 'raw', 'profile']
    }
  })

  const getUrl = (url: string) => {
    const { defaults } = grant
    return `${defaults.origin}${defaults.prefix}/${url}`
  }

  each(grant, (value, name) => {
    if (name !== 'defaults') {
      value.redirect_uri = value.redirect_uri || getUrl(`${name}/callback`)

      if (!strategyNames.includes(name)) {
        debug(`Registering oAuth default strategy for '${name}'`)
        service.register(name, new OAuthStrategy())
      }
    }
  })

  app.set('grant', grant)
}

export const express =
  (settings: Partial<OauthSetupSettings> = {}) =>
  (app: Application) => {
    const options = getDefaultSettings(app, settings)

    app.configure(setup(options))
    app.configure(setupExpress(options))
  }

export const expressOauth = express

export const oauth =
  (settings: Partial<OauthSetupSettings> = {}) =>
  (app: Application) => {
    const options = getDefaultSettings(app, settings)
    const expressSession = session({
      secret: Math.random().toString(36).substring(7),
      saveUninitialized: true,
      resave: true
    })
    const setExpressParams = (req: any, res: any, next: any) => {
      req.feathers = {
        ...req.feathers,
        session: req.session,
        state: res.locals
      }
      next()
    }
    const setKoaParams = async (ctx: any, next: any) => {
      ctx.session.destroy = async () => {
        ctx.session = null
      }

      ctx.feathers = {
        ...ctx.feathers,
        session: ctx.session,
        state: ctx.state
      }

      await next()

      if (ctx.originalUrl.endsWith('authenticate')) {
        ctx.session = null
      } else {
        await ctx.session.save()
      }
    }
    ;(app as any).keys = ['grant']

    const serviceOptions: ServiceOptions = {
      express: {
        before: [expressSession, setExpressParams]
      },
      koa: {
        before: [koaSession(app as any), setKoaParams]
      }
    }

    app.configure(setup(options))
    app.use('/oauth/:provider', new OAuthService(app, options), serviceOptions)
    app.service('/oauth/:provider').hooks({
      around: { all: [redirectHook()] }
    })
  }
