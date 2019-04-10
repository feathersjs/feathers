import {
  AuthenticationStrategy, AuthenticationRequest, AuthenticationBase, AuthenticationResult
} from '@feathersjs/authentication';
import { Params, Application, Service } from '@feathersjs/feathers';

// @ts-ignore
import rc from 'request-compose';

const request = rc.extend({
  Request: {oauth: require('request-oauth')}
}).client;

export interface OAuthProfile {
  id?: string|number;
  [key: string]: any;
}

export class OAuthStrategy implements AuthenticationStrategy {
  authentication?: AuthenticationBase;
  app?: Application;
  name?: string;

  setAuthentication (auth: AuthenticationBase): void {
    this.authentication = auth;
  }

  setApplication (app: Application) {
    this.app = app;
  }

  setName (name: string) {
    this.name = name;
  }

  get configuration () {
    const { entity, service, entityId } = this.authentication.configuration;
    
    return { entity, service, entityId };
  }

  get entityService (): Service<any> {
    return this.app.service(this.configuration.service);
  }

  async getProfile (authResult: AuthenticationResult, _params: Params) {
    const config = this.app.get('grant');
    const { body } = await request({
      url: 'https://api.twitter.com/1.1/users/show.json',
      qs: { user_id: authResult.raw.user_id },
      oauth: {
        consumer_key: config.twitter.key,
        consumer_secret: config.twitter.secret,
        token: authResult.access_token,
        token_secret: authResult.access_secret
      }
    });

    return body;
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
      ? this.createEntity(profile, params)
      : this.updateEntity(existingEntity, profile, params);

    return {
      authentication: { strategy: this.name },
      [entity]: authEntity
    };
  }
}
