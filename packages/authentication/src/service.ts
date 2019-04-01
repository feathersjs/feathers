import Debug from 'debug';
import { merge, get } from 'lodash';
import { NotAuthenticated } from '@feathersjs/errors';
import { AuthenticationBase, AuthenticationResult, AuthenticationRequest } from './core';
import { connection, events } from './hooks';
import { Params, ServiceMethods } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/authentication/service');

export class AuthenticationService extends AuthenticationBase implements ServiceMethods<AuthenticationResult> {
  getPayload(_authResult: AuthenticationResult, params: Params) {
    // Uses `params.payload` or returns an empty payload
    const { payload = {} } = params;

    return Promise.resolve(payload);
  }

  async getJwtOptions(authResult: AuthenticationResult, params: Params) {
    const { service, entity, entityId } = this.configuration;
    const jwtOptions = merge({}, params.jwt);
    const hasEntity = service && entity && authResult[entity];

    // Set the subject to the entity id if it is available
    if (hasEntity && !jwtOptions.subject) {
      const idProperty = entityId || this.app.service(service).id;
      const subject = get(authResult, [ entity, idProperty ]);

      if (subject === undefined) {
        throw new NotAuthenticated(`Can not set subject from ${entity}.${idProperty}`);
      }

      jwtOptions.subject = `${subject}`;
    }

    return Promise.resolve(jwtOptions);
  }

  async create(data: AuthenticationRequest, params?: Params) {
    const { strategies } = this.configuration;

    if (!strategies.length) {
      throw new NotAuthenticated('No authentication strategies allowed for creating a JWT');
    }

    const authResult = await this.authenticate(data, params, ...strategies);

    debug('Got authentication result', authResult);

    const [ payload, jwtOptions ] = await Promise.all([
      this.getPayload(authResult, params),
      this.getJwtOptions(authResult, params)
    ]);

    if (authResult.accessToken) {
      return authResult;
    }

    debug('Creating JWT with', payload, jwtOptions);

    const accessToken = await this.createJWT(payload, jwtOptions, params.secret);

    return Object.assign({}, { accessToken }, authResult);
  }

  async remove(id: null|string, params?: Params) {
    const { authentication } = params;
    const { strategies } = this.configuration;

    // When an id is passed it is expected to be the authentication `accessToken`
    if (id !== null && id !== authentication.accessToken) {
      throw new NotAuthenticated('Invalid access token');
    }

    debug('Verifying authentication strategy in remove');

    return this.authenticate(authentication, params, ...strategies);
  }

  setup() {
    // The setup method checks for valid settings and registers the
    // connection and event (login, logout) hooks
    const { secret, service, entity, entityId, strategies } = this.configuration;

    if (typeof secret !== 'string') {
      throw new Error(`A 'secret' must be provided in your authentication configuration`);
    }

    if (entity !== null) {
      if (this.app.service(service) === undefined) {
        throw new Error(`The '${service}' entity service does not exist (set to 'null' if it is not required)`);
      }

      if (this.app.service(service).id === undefined && entityId === undefined) {
        throw new Error(`The '${service}' service does not have an 'id' property and no 'entityId' option is set.`);
      }
    }

    if (strategies.length === 0) {
      throw new Error(`At least one valid authentication strategy required in '${this.configKey}.strategies'`);
    }

    // @ts-ignore
    this.hooks({ after: [ connection(), events() ] });
  }
}
