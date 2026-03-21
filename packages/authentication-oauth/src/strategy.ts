import {
  AuthenticationRequest,
  AuthenticationBaseStrategy,
  AuthenticationResult,
  AuthenticationParams
} from '@feathersjs/authentication'
import { Params } from '@feathersjs/feathers'
import { NotAuthenticated } from '@feathersjs/errors'
import { createDebug, _ } from '@feathersjs/commons'
import qs from 'qs'

const debug = createDebug('@feathersjs/authentication-oauth/strategy')

/**
 * Validates that appending a user-supplied path to a base URL does not change the origin.
 * Uses both URL resolution and string concatenation checks to catch all open redirect vectors:
 * authority injection (@), protocol-relative (//), backslash, and domain suffix attacks.
 *
 * @throws NotAuthenticated if the redirect path would change the URL origin
 */
function validateRedirectOrigin(baseUrl: string, redirectPath: string) {
  let allowedOrigin: string

  try {
    allowedOrigin = new URL(baseUrl).origin
  } catch {
    // baseUrl is a relative path (e.g. /home) — no open redirect risk
    return
  }

  try {
    // URL resolution catches protocol-relative (//) and backslash attacks
    // e.g. new URL('//attacker.com', 'https://target.com') → https://attacker.com
    const resolvedUrl = new URL(redirectPath, baseUrl)

    if (resolvedUrl.origin !== allowedOrigin) {
      throw new NotAuthenticated('Invalid redirect path.')
    }

    // String concatenation check catches domain suffix attacks
    // e.g. 'https://target.com' + '.evil.com' → https://target.com.evil.com
    const concatenatedUrl = new URL(`${baseUrl}${redirectPath}`)

    if (concatenatedUrl.origin !== allowedOrigin) {
      throw new NotAuthenticated('Invalid redirect path.')
    }
  } catch (error: any) {
    if (error instanceof NotAuthenticated) throw error
    throw new NotAuthenticated('Invalid redirect path.')
  }
}

export interface OAuthProfile {
  id?: string | number
  [key: string]: any
}

export class OAuthStrategy extends AuthenticationBaseStrategy {
  get configuration() {
    const { entity, service, entityId, oauth } = this.authentication.configuration
    const config = oauth[this.name] as any

    return {
      entity,
      service,
      entityId,
      ...config
    }
  }

  get entityId(): string {
    const { entityService } = this

    return this.configuration.entityId || (entityService && (entityService as any).id)
  }

  async getEntityQuery(profile: OAuthProfile, _params: Params) {
    return {
      [`${this.name}Id`]: profile.sub || profile.id
    }
  }

  async getEntityData(profile: OAuthProfile, _existingEntity: any, _params: Params) {
    return {
      [`${this.name}Id`]: profile.sub || profile.id
    }
  }

  async getProfile(data: AuthenticationRequest, _params: Params) {
    return data.profile
  }

  async getCurrentEntity(params: Params) {
    const { authentication } = params
    const { entity } = this.configuration

    if (authentication && authentication.strategy) {
      debug('getCurrentEntity with authentication', authentication)

      const { strategy } = authentication
      const authResult = await this.authentication.authenticate(authentication, params, strategy)

      return authResult[entity]
    }

    return null
  }

  async getAllowedOrigin(params?: Params) {
    const { redirect, origins = this.app.get('origins') } = this.authentication.configuration.oauth

    if (Array.isArray(origins)) {
      const referer = params?.headers?.referer || origins[0]

      // Parse the referer to get its origin for proper comparison
      let refererOrigin: string
      try {
        refererOrigin = new URL(referer).origin
      } catch {
        throw new NotAuthenticated(`Invalid referer "${referer}".`)
      }

      // Compare full origins
      const allowedOrigin = origins.find((current) => refererOrigin.toLowerCase() === current.toLowerCase())

      if (!allowedOrigin) {
        throw new NotAuthenticated(`Referer "${referer}" is not allowed.`)
      }

      return allowedOrigin
    }

    return redirect
  }

  async getRedirect(
    data: AuthenticationResult | Error,
    params?: AuthenticationParams
  ): Promise<string | null> {
    const queryRedirect = (params && params.redirect) || ''
    const redirect = await this.getAllowedOrigin(params)

    if (!redirect) {
      return null
    }

    if (queryRedirect) {
      validateRedirectOrigin(redirect, queryRedirect)
    }

    const redirectUrl = `${redirect}${queryRedirect}`
    const separator = redirectUrl.endsWith('?') ? '' : redirect.indexOf('#') !== -1 ? '?' : '#'
    const authResult: AuthenticationResult = data
    const query = authResult.accessToken
      ? { access_token: authResult.accessToken }
      : { error: data.message || 'OAuth Authentication not successful' }

    return `${redirectUrl}${separator}${qs.stringify(query)}`
  }

  async findEntity(profile: OAuthProfile, params: Params) {
    const query = await this.getEntityQuery(profile, params)

    debug('findEntity with query', query)

    const result = await this.entityService.find({
      ...params,
      query
    })
    const [entity = null] = result.data ? result.data : result

    debug('findEntity returning', entity)

    return entity
  }

  async createEntity(profile: OAuthProfile, params: Params) {
    const data = await this.getEntityData(profile, null, params)

    debug('createEntity with data', data)

    return this.entityService.create(data, _.omit(params, 'query'))
  }

  async updateEntity(entity: any, profile: OAuthProfile, params: Params) {
    const id = entity[this.entityId]
    const data = await this.getEntityData(profile, entity, params)

    debug(`updateEntity with id ${id} and data`, data)

    return this.entityService.patch(id, data, _.omit(params, 'query'))
  }

  async getEntity(result: any, params: Params) {
    const { entityService } = this
    const { entityId = (entityService as any).id, entity } = this.configuration

    if (!entityId || result[entityId] === undefined) {
      throw new NotAuthenticated('Could not get oAuth entity')
    }

    if (!params.provider) {
      return result
    }

    return entityService.get(result[entityId], {
      ..._.omit(params, 'query'),
      [entity]: result
    })
  }

  async authenticate(authentication: AuthenticationRequest, originalParams: AuthenticationParams) {
    const entity: string = this.configuration.entity
    const { provider, ...params } = originalParams
    const profile = await this.getProfile(authentication, params)
    const existingEntity = (await this.findEntity(profile, params)) || (await this.getCurrentEntity(params))

    debug('authenticate with (existing) entity', existingEntity)

    const authEntity = !existingEntity
      ? await this.createEntity(profile, params)
      : await this.updateEntity(existingEntity, profile, params)

    return {
      authentication: { strategy: this.name },
      [entity]: await this.getEntity(authEntity, originalParams)
    }
  }
}
