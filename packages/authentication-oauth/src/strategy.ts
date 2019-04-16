// @ts-ignore
import getProfile from 'grant-profile/lib/client';
import {
  AuthenticationRequest, AuthenticationBaseStrategy
} from '@feathersjs/authentication';
import { Params } from '@feathersjs/feathers';

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

  async getProfile (data: AuthenticationRequest, _params: Params) {
    const config = this.app.get('grant');
    const provider = config[data.strategy];

    return getProfile(provider, data);
  }

  async findEntity (profile: OAuthProfile, params: Params) {
    const query = {
      [`${this.name}Id`]: profile.id
    };
    const result = await this.entityService.find({
      ...params,
      query
    });
    const [ entity = null ] = result.data ? result.data : result;

    return entity;
  }

  async createEntity (profile: OAuthProfile, params: Params) {
    return this.entityService.create({
      [`${this.name}Id`]: profile.id
    }, params);
  }

  async updateEntity (entity: any, profile: OAuthProfile, params: Params) {
    const idField = this.configuration.entityId || this.entityService.id;
    const id = entity[idField];
    const data = {
      [`${this.name}Id`]: profile.id
    };

    return this.entityService.patch(id, data, params);
  }

  async authenticate (authentication: AuthenticationRequest, params: Params) {
    if (authentication.strategy !== this.name) {
      throw new Error('Nope');
    }

    const { entity } = this.configuration;
    const profile = await this.getProfile(authentication, params);
    const existingEntity = await this.findEntity(profile, params);
    const authEntity = existingEntity === null
      ? await this.createEntity(profile, params)
      : await this.updateEntity(existingEntity, profile, params);

    return {
      authentication: { strategy: this.name },
      [entity]: authEntity
    };
  }
}
