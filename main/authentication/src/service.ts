import { merge } from 'https://deno.land/x/lodash@4.17.19/lodash.js';
import { NotAuthenticated } from '../../errors/src/index.ts';
import { AuthenticationBase, AuthenticationResult, AuthenticationRequest } from './core.ts';
import { connection, event } from './hooks/index.ts';
import '../../transport-commons/src/index.ts';
import { createDebug } from '../../commons/src/index.ts';
import { Params, ServiceMethods, ServiceAddons } from '../../feathers/src/index.ts';
import jsonwebtoken from 'jsonwebtoken';

const debug = createDebug('@feathersjs/authentication/service');

declare module '@feathersjs/feathers/lib/declarations' {
  interface FeathersApplication<Services, Settings> { // eslint-disable-line
    /**
     * Returns the default authentication service or the
     * authentication service for a given path.
     *
     * @param location The service path to use (optional)
     */
    defaultAuthentication? (location?: string): AuthenticationService;
  }

  interface Params {
    authenticated?: boolean;
    authentication?: AuthenticationRequest;
  }
}

// eslint-disable-next-line
export interface AuthenticationService extends ServiceAddons<AuthenticationResult, AuthenticationResult> {}

export class AuthenticationService extends AuthenticationBase implements Partial<ServiceMethods<AuthenticationResult>> {
  constructor (app: any, configKey = 'authentication', options = {}) {
    super(app, configKey, options);

    if (typeof app.defaultAuthentication !== 'function') {
      app.defaultAuthentication = function (location?: string) {
        const configKey = app.get('defaultAuthentication');
        const path = location || Object.keys(this.services).find(current =>
          this.service(current).configKey === configKey
        );

        return path ? this.service(path) : null;
      };
    }
  }
  /**
   * Return the payload for a JWT based on the authentication result.
   * Called internally by the `create` method.
   *
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
   *
   * @param authResult The authentication result
   * @param params Service call parameters
   */
  async getTokenOptions (authResult: AuthenticationResult, params: Params) {
    const { service, entity, entityId } = this.configuration;
    const jwtOptions = merge({}, params.jwtOptions, params.jwt);
    const value = service && entity && authResult[entity];

    // Set the subject to the entity id if it is available
    if (value && !jwtOptions.subject) {
      const idProperty = entityId || this.app.service(service).id;
      const subject = value[idProperty];

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
   *
   * @param data The authentication request (should include `strategy` key)
   * @param params Service call parameters
   */
  async create (data: AuthenticationRequest, params?: Params) {
    const authStrategies = params.authStrategies || this.configuration.authStrategies;

    if (!authStrategies.length) {
      throw new NotAuthenticated('No authentication strategies allowed for creating a JWT (`authStrategies`)');
    }

    const authResult = await this.authenticate(data, params, ...authStrategies);

    debug('Got authentication result', authResult);

    if (authResult.accessToken) {
      return authResult;
    }

    const [ payload, jwtOptions ] = await Promise.all([
      this.getPayload(authResult, params),
      this.getTokenOptions(authResult, params)
    ]);

    debug('Creating JWT with', payload, jwtOptions);

    const accessToken = await this.createAccessToken(payload, jwtOptions, params.secret);

    return merge({ accessToken }, authResult, {
      authentication: {
          accessToken,
          payload: jsonwebtoken.decode(accessToken)
      }
    });
  }

  /**
   * Mark a JWT as removed. By default only verifies the JWT and returns the result.
   * Triggers the `logout` event.
   *
   * @param id The JWT to remove or null
   * @param params Service call parameters
   */
  async remove (id: string | null, params?: Params) {
    const { authentication } = params;
    const { authStrategies } = this.configuration;

    // When an id is passed it is expected to be the authentication `accessToken`
    if (id !== null && id !== authentication.accessToken) {
      throw new NotAuthenticated('Invalid access token');
    }

    debug('Verifying authentication strategy in remove');

    return this.authenticate(authentication, params, ...authStrategies);
  }

  /**
   * Validates the service configuration.
   */
  async setup () {
    // The setup method checks for valid settings and registers the
    // connection and event (login, logout) hooks
    const { secret, service, entity, entityId } = this.configuration;

    if (typeof secret !== 'string') {
      throw new Error('A \'secret\' must be provided in your authentication configuration');
    }

    if (entity !== null) {
      if (service === undefined) {
        throw new Error('The \'service\' option is not set in the authentication configuration');
      }

      if (this.app.service(service) === undefined) {
        throw new Error(`The '${service}' entity service does not exist (set to 'null' if it is not required)`);
      }

      if (this.app.service(service).id === undefined && entityId === undefined) {
        throw new Error(`The '${service}' service does not have an 'id' property and no 'entityId' option is set.`);
      }
    }

    (this as any).hooks({
      create: [ connection('login'), event('login') ],
      remove: [ connection('logout'), event('logout') ]
    });

    this.app.on('disconnect', async (connection) => {
      await this.handleConnection('disconnect', connection);
    });

    if (typeof this.publish === 'function') {
      this.publish(() => null);
    }
  }
}
