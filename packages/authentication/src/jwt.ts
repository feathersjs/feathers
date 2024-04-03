/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
import { IncomingMessage } from 'http'
import { NotAuthenticated } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
// @ts-ignore
import lt from 'long-timeout'

import { AuthenticationBaseStrategy } from './strategy'
import { AuthenticationParams, AuthenticationRequest, AuthenticationResult, ConnectionEvent } from './core'

const debug = createDebug('@feathersjs/authentication/jwt')
const SPLIT_HEADER = /(\S+)\s+(\S+)/

export class JWTStrategy extends AuthenticationBaseStrategy {
  expirationTimers = new WeakMap()

  get configuration() {
    const authConfig = this.authentication.configuration
    const config = super.configuration

    return {
      service: authConfig.service,
      entity: authConfig.entity,
      entityId: authConfig.entityId,
      header: 'Authorization',
      schemes: ['Bearer', 'JWT'],
      ...config
    }
  }

  async handleConnection(
    event: ConnectionEvent,
    connection: any,
    authResult?: AuthenticationResult
  ): Promise<void> {
    const isValidLogout =
      event === 'logout' &&
      connection.authentication &&
      authResult &&
      connection.authentication.accessToken === authResult.accessToken

    const { accessToken } = authResult || {}
    const { entity } = this.configuration

    if (accessToken && event === 'login') {
      debug('Adding authentication information to connection')
      const { exp } =
        authResult?.authentication?.payload || (await this.authentication.verifyAccessToken(accessToken))
      // The time (in ms) until the token expires
      const duration = exp * 1000 - Date.now()
      const timer = lt.setTimeout(() => this.app.emit('disconnect', connection), duration)

      debug(`Registering connection expiration timer for ${duration}ms`)
      lt.clearTimeout(this.expirationTimers.get(connection))
      this.expirationTimers.set(connection, timer)

      debug('Adding authentication information to connection')
      connection.authentication = {
        strategy: this.name,
        accessToken
      }
      connection[entity] = authResult[entity]
    } else if (event === 'disconnect' || isValidLogout) {
      debug('Removing authentication information and expiration timer from connection')

      await new Promise((resolve) =>
        process.nextTick(() => {
          delete connection[entity]
          delete connection.authentication
          resolve(connection)
        })
      )

      lt.clearTimeout(this.expirationTimers.get(connection))
      this.expirationTimers.delete(connection)
    }
  }

  verifyConfiguration() {
    const allowedKeys = ['entity', 'entityId', 'service', 'header', 'schemes']

    for (const key of Object.keys(this.configuration)) {
      if (!allowedKeys.includes(key)) {
        throw new Error(
          `Invalid JwtStrategy option 'authentication.${this.name}.${key}'. Did you mean to set it in 'authentication.jwtOptions'?`
        )
      }
    }

    if (typeof this.configuration.header !== 'string') {
      throw new Error(`The 'header' option for the ${this.name} strategy must be a string`)
    }
  }

  async getEntityQuery(_params: Params) {
    return {}
  }

  /**
   * Return the entity for a given id
   *
   * @param id The id to use
   * @param params Service call parameters
   */
  async getEntity(id: string, params: Params) {
    const entityService = this.entityService
    const { entity } = this.configuration

    debug('Getting entity', id)

    if (entityService === null) {
      throw new NotAuthenticated('Could not find entity service')
    }

    const query = await this.getEntityQuery(params)
    const { provider, ...paramsWithoutProvider } = params
    const result = await entityService.get(id, {
      ...paramsWithoutProvider,
      query
    })

    if (!params.provider) {
      return result
    }

    return entityService.get(id, { ...params, [entity]: result })
  }

  async getEntityId(authResult: AuthenticationResult, _params: Params) {
    return authResult.authentication.payload.sub
  }

  async authenticate(authentication: AuthenticationRequest, params: AuthenticationParams) {
    const { accessToken } = authentication
    const { entity } = this.configuration

    if (!accessToken) {
      throw new NotAuthenticated('No access token')
    }

    const payload = await this.authentication.verifyAccessToken(accessToken, params.jwt)
    const result = {
      accessToken,
      authentication: {
        strategy: 'jwt',
        accessToken,
        payload
      }
    }

    if (entity === null) {
      return result
    }

    const entityId = await this.getEntityId(result, params)
    const value = await this.getEntity(entityId, params)

    return {
      ...result,
      [entity]: value
    }
  }

  async parse(req: IncomingMessage): Promise<{
    strategy: string
    accessToken: string
  } | null> {
    const { header, schemes }: { header: string; schemes: string[] } = this.configuration
    const headerValue = req.headers && req.headers[header.toLowerCase()]

    if (!headerValue || typeof headerValue !== 'string') {
      return null
    }

    debug('Found parsed header value')

    const [, scheme, schemeValue] = headerValue.match(SPLIT_HEADER) || []
    const hasScheme = scheme && schemes.some((current) => new RegExp(current, 'i').test(scheme))

    if (scheme && !hasScheme) {
      return null
    }

    return {
      strategy: this.name,
      accessToken: hasScheme ? schemeValue : headerValue
    }
  }
}
