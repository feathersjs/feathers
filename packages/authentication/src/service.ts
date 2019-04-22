import Debug from 'debug';
import { merge, get } from 'lodash';
import { NotAuthenticated } from '@feathersjs/errors';
import { AuthenticationBase, AuthenticationResult, AuthenticationRequest } from './core';
import { connection, events } from './hooks';
import { Params, ServiceMethods } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/authentication/service');

export class AuthenticationService extends AuthenticationBase implements ServiceMethods<AuthenticationResult> {
  /**
   * Return the payload for a JWT based on the authentication result.
   * Called internally by the `create` method.
   * @param _authResult The current authentication result
   * @param params The service call parameters
   */
  async getPayload (_authResult: AuthenticationResult, params: Params) {
    // Uses `params.payload` or returns an empty payload
    const { payload = {} } = params;

    return payload;
  }

  /**
   * Returns the JWT options based on an authentication result.
   * By default sets the JWT subject to the entity id.
   * @param authResult The authentication result
   * @param params Service call parameters
   */
  async getJwtOptions (authResult: AuthenticationResult, params: Params) {
    const { service, entity, entityId } = this.configuration;
    const jwtOptions = merge({}, params.jwtOptions, params.jwt);
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

    return jwtOptions;
  }

  /**
   * Create and return a new JWT for a given authentication request.
   * Will trigger the `login` event.
   * @param data The authentication request (should include `strategy` key)
   * @param params Service call parameters
   */
  async create (data: AuthenticationRequest, params: Params) {
    const jwtStrategies = params.jwtStrategies || this.configuration.jwtStrategies;

    if (!jwtStrategies.length) {
      throw new NotAuthenticated('No authentication strategies allowed for creating a JWT (`jwtStrategies`)');
    }

    const authResult = await this.authenticate(data, params, ...jwtStrategies);

    debug('Got authentication result', authResult);

    const [ payload, jwtOptions ] = await Promise.all([
      this.getPayload(authResult, params),
      this.getJwtOptions(authResult, params)
    ]);

    if (authResult.accessToken) {
      return authResult;
    }

    debug('Creating JWT with', payload, jwtOptions);

    const accessToken = await this.createAccessToken(payload, jwtOptions, params.secret);

    return Object.assign({}, { accessToken }, authResult);
  }

  /**
   * Mark a JWT as removed. By default only verifies the JWT and returns the result.
   * Triggers the `logout` event.
   * @param id The JWT to remove or null
   * @param params Service call parameters
   */
  async remove (id: null|string, params: Params) {
    const { authentication } = params;
    const { jwtStrategies } = this.configuration;

    // When an id is passed it is expected to be the authentication `accessToken`
    if (id !== null && id !== authentication.accessToken) {
      throw new NotAuthenticated('Invalid access token');
    }

    debug('Verifying authentication strategy in remove');

    return this.authenticate(authentication, params, ...jwtStrategies);
  }

  /**
   * Validates the service configuration.
   */
  setup () {
    // The setup method checks for valid settings and registers the
    // connection and event (login, logout) hooks
    const { secret, service, entity, entityId } = this.configuration;

    if (typeof secret !== 'string') {
      throw new Error(`A 'secret' must be provided in your authentication configuration`);
    }

    if (entity !== null) {
      if (service === undefined) {
        throw new Error(`The 'service' option is not set in the authentication configuration`);
      }

      if (this.app.service(service) === undefined) {
        throw new Error(`The '${service}' entity service does not exist (set to 'null' if it is not required)`);
      }

      if (this.app.service(service).id === undefined && entityId === undefined) {
        throw new Error(`The '${service}' service does not have an 'id' property and no 'entityId' option is set.`);
      }
    }

    // @ts-ignore
    this.hooks({ after: [ connection(), events() ] });
  }
}
