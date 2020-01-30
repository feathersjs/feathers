// @ts-ignore
import getProfile from 'grant-profile/lib/client';
import querystring from 'querystring';
import Debug from 'debug';
import {
  AuthenticationRequest, AuthenticationBaseStrategy, AuthenticationResult
} from '@feathersjs/authentication';
import { Params } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/authentication-oauth/strategy');

export interface OAuthProfile {
  id?: string|number;
  [key: string]: any;
}

export class OAuthStrategy extends AuthenticationBaseStrategy {
  get configuration () {
    const { entity, service, entityId, oauth } = this.authentication.configuration;
    const config = oauth[this.name];

    return {
      entity,
      service,
      entityId,
      ...config
    };
  }

  get entityId (): string {
    const { entityService } = this;

    return this.configuration.entityId || (entityService && entityService.id);
  }

  async getEntityQuery (profile: OAuthProfile, _params: Params) {
    return {
      [`${this.name}Id`]: profile.sub || profile.id
    };
  }

  async getEntityData (profile: OAuthProfile, _existingEntity: any, _params: Params) {
    return {
      [`${this.name}Id`]: profile.sub || profile.id
    };
  }

  /* istanbul ignore next */
  async getProfile (data: AuthenticationRequest, _params: Params) {
    const config = this.app.get('grant');
    const provider = config[data.strategy];

    debug('getProfile of oAuth profile from grant-profile with', data);

    return getProfile(provider, data);
  }

  async getCurrentEntity (params: Params) {
    const { authentication } = params;
    const { entity } = this.configuration;

    if (authentication && authentication.strategy) {
      debug('getCurrentEntity with authentication', authentication);

      const { strategy } = authentication;
      const authResult = await this.authentication
        .authenticate(authentication, params, strategy);

      return authResult[entity];
    }

    return null;
  }

  async getRedirect (data: AuthenticationResult|Error, params?: Params) {
    const queryRedirect = (params && params.redirect) || '';
    const { redirect } = this.authentication.configuration.oauth;

    if (!redirect) {
      return null;
    }

    const redirectUrl = redirect + queryRedirect;
    const separator = redirect.endsWith('?') ? '' :
      (redirect.indexOf('#') !== -1 ? '?' : '#');
    const authResult: AuthenticationResult = data;
    const query = authResult.accessToken ? {
      access_token: authResult.accessToken
    } : {
      error: data.message || 'OAuth Authentication not successful'
    };

    return redirectUrl + separator + querystring.stringify(query);
  }

  async findEntity (profile: OAuthProfile, params: Params) {
    const query = await this.getEntityQuery(profile, params);

    debug('findEntity with query', query);

    const result = await this.entityService.find({
      ...params,
      query
    });
    const [ entity = null ] = result.data ? result.data : result;

    debug('findEntity returning', entity);

    return entity;
  }

  async createEntity (profile: OAuthProfile, params: Params) {
    const data = await this.getEntityData(profile, null, params);

    debug('createEntity with data', data);

    return this.entityService.create(data, params);
  }

  async updateEntity (entity: any, profile: OAuthProfile, params: Params) {
    const id = entity[this.entityId];
    const data = await this.getEntityData(profile, entity, params);

    debug(`updateEntity with id ${id} and data`, data);

    return this.entityService.patch(id, data, params);
  }

  async authenticate (authentication: AuthenticationRequest, params: Params) {
    const entity: string = this.configuration.entity;
    const profile = await this.getProfile(authentication, params);
    const existingEntity = await this.findEntity(profile, params)
      || await this.getCurrentEntity(params);

    debug(`authenticate with (existing) entity`, existingEntity);

    const authEntity = !existingEntity ? await this.createEntity(profile, params)
      : await this.updateEntity(existingEntity, profile, params);

    return {
      authentication: { strategy: this.name },
      [entity]: authEntity
    };
  }
}
