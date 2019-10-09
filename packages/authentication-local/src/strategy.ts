import bcrypt from 'bcryptjs';
import { get, omit } from 'lodash';
import Debug from 'debug';
import { NotAuthenticated } from '@feathersjs/errors';
import { Query, Params } from '@feathersjs/feathers';
import {
  AuthenticationRequest, AuthenticationBaseStrategy
} from '@feathersjs/authentication';

const debug = Debug('@feathersjs/authentication-local/strategy');

export class LocalStrategy extends AuthenticationBaseStrategy {
  verifyConfiguration () {
    const config = this.configuration;

    [ 'usernameField', 'passwordField' ].forEach(prop => {
      if (typeof config[prop] !== 'string') {
        throw new Error(`'${this.name}' authentication strategy requires a '${prop}' setting`);
      }
    });
  }

  get configuration () {
    const authConfig = this.authentication.configuration;
    const config = super.configuration || {};

    return {
      hashSize: 10,
      service: authConfig.service,
      entity: authConfig.entity,
      entityId: authConfig.entityId,
      errorMessage: 'Invalid login',
      entityPasswordField: config.passwordField,
      entityUsernameField: config.usernameField,
      ...config
    };
  }

  async getEntityQuery (query: Query, _params: Params) {
    return {
      $limit: 1,
      ...query
    };
  }

  async findEntity (username: string, params: Params) {
    const { entityUsernameField, service, errorMessage } = this.configuration;
    if (!username) { // don't query for users without any condition set.
      throw new NotAuthenticated(errorMessage);
    }

    const query = await this.getEntityQuery({
      [entityUsernameField]: username
    }, params);

    const findParams = Object.assign({}, params, { query });
    const entityService = this.app.service(service);

    debug('Finding entity with query', params.query);

    const result = await entityService.find(findParams);
    const list = Array.isArray(result) ? result : result.data;

    if (!Array.isArray(list) || list.length === 0) {
      debug(`No entity found`);

      throw new NotAuthenticated(errorMessage);
    }

    const [ entity ] = list;

    return entity;
  }

  async getEntity (result: any, params: Params) {
    const { entityService } = this;
    const { entityId = entityService.id, entity } = this.configuration;

    if (!entityId || result[entityId] === undefined) {
      throw new NotAuthenticated('Could not get local entity');
    }

    if (!params.provider) {
      return result;
    }

    return entityService.get(result[entityId], {
      ...params,
      [entity]: result
    });
  }

  async comparePassword (entity: any, password: string) {
    const { entityPasswordField, errorMessage } = this.configuration;
    // find password in entity, this allows for dot notation
    const hash = get(entity, entityPasswordField);

    if (!hash) {
      debug(`Record is missing the '${entityPasswordField}' password field`);

      throw new NotAuthenticated(errorMessage);
    }

    debug('Verifying password');

    const result = await bcrypt.compare(password, hash);

    if (result) {
      return entity;
    }

    throw new NotAuthenticated(errorMessage);
  }

  async hashPassword (password: string, _params: Params) {
    return bcrypt.hash(password, this.configuration.hashSize);
  }

  async authenticate (data: AuthenticationRequest, params: Params) {
    const { passwordField, usernameField, entity } = this.configuration;
    const username = data[usernameField];
    const password = data[passwordField];
    const result = await this.findEntity(username, omit(params, 'provider'));

    await this.comparePassword(result, password);

    return {
      authentication: { strategy: this.name },
      [entity]: await this.getEntity(result, params)
    };
  }
}
