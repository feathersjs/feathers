// @ts-ignore
import getProfile from 'grant-profile/lib/client';
import Debug from 'debug';
import {
  AuthenticationRequest, AuthenticationBaseStrategy
} from '@feathersjs/authentication';
import { Params } from '@feathersjs/feathers';
import { NotAuthenticated } from '@feathersjs/errors';

const debug = Debug('@feathersjs/authentication-oauth/strategy');

export interface OAuthProfile {
  id?: string|number;
  [key: string]: any;
}

export class OAuthStrategy extends AuthenticationBaseStrategy {
  get configuration () {
    const { entity, service, entityId } = this.authentication.configuration;

    return {
      entity,
      service,
      entityId,
      ...super.configuration
    };
  }

  get entityId (): string {
    return this.configuration.entityId || this.entityService.id;
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

      return authResult[entity] || null;
    }

    return null;
  }

  async findEntity (profile: OAuthProfile, params: Params) {
    const query = {
      [`${this.name}Id`]: profile.id
    };

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
    const data = {
      [`${this.name}Id`]: profile.id
    };

    debug('createEntity with data', data);

    return this.entityService.create(data, params);
  }

  async updateEntity (entity: any, profile: OAuthProfile, params: Params) {
    const id = entity[this.entityId];
    const data = {
      [`${this.name}Id`]: profile.id
    };

    debug(`updateEntity with id ${id} and data`, data);

    return this.entityService.patch(id, data, params);
  }

  async authenticate (authentication: AuthenticationRequest, params: Params) {
    if (authentication.strategy !== this.name) {
      throw new NotAuthenticated('Not authenticated');
    }

    const entity: string = this.configuration.entity;
    const profile = await this.getProfile(authentication, params);
    const existingEntity = await this.findEntity(profile, params)
      || await this.getCurrentEntity(params);

    debug(`authenticate with (existing) entity`, existingEntity);

    const authEntity = existingEntity === null
      ? await this.createEntity(profile, params)
      : await this.updateEntity(existingEntity, profile, params);

    return {
      authentication: { strategy: this.name },
      [entity]: authEntity
    };
  }
}
