import { promisify } from 'util';
import { merge } from 'lodash';
import jsonwebtoken, { SignOptions, Secret, VerifyOptions } from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';
import { NotAuthenticated, BadRequest } from '@feathersjs/errors';
import Debug from 'debug';
import { Application, Params } from '@feathersjs/feathers';
import { IncomingMessage, ServerResponse } from 'http';
import defaultOptions from './options';

const debug = Debug('@feathersjs/authentication/base');
const verifyJWT = promisify(jsonwebtoken.verify);
const createJWT = promisify(jsonwebtoken.sign);

export interface AuthenticationResult {
  [key: string]: any;
}

export interface AuthenticationRequest {
  strategy?: string;
  [key: string]: any;
}

export interface AuthenticationStrategy {
  /**
   * Implement this method to get access to the AuthenticationService
   * @param auth The AuthenticationService
   */
  setAuthentication?(auth: AuthenticationBase): void;
  /**
   * Implement this method to get access to the Feathers application
   * @param app The Feathers application instance
   */
  setApplication?(app: Application): void;
  /**
   * Implement this method to get access to the strategy name
   * @param name The name of the strategy
   */
  setName?(name: string): void;
  /**
   * Implement this method to verify the current configuration 
   * and throw an error if it is invalid.
   */
  verifyConfiguration?(): void;
  /**
   * Authenticate an authentication request with this strategy.
   * Should throw an error if the strategy did not succeed.
   * @param authentication The authentication request
   * @param params The service call parameters
   */
  authenticate(authentication: AuthenticationRequest, params: Params): Promise<AuthenticationResult>;
  /**
   * Parse a basic HTTP request and response for authentication request information.
   * @param req The HTTP request
   * @param res The HTTP response
   */
  parse(req: IncomingMessage, res: ServerResponse): Promise<AuthenticationRequest|null>;
}

export interface JwtVerifyOptions extends VerifyOptions {
  algorithm?: string|string[];
}

/**
 * A base class for managing authentication strategies and creating and verifying JWTs
 */
export class AuthenticationBase {
  app: Application;
  configKey: string;
  strategies: {
    [key: string]: AuthenticationStrategy;
  };

  /**
   * Create a new authentication service.
   * @param app The Feathers application instance
   * @param configKey The configuration key name in `app.get` (default: `authentication`)
   * @param options Optional initial options
   */
  constructor(app: Application, configKey: string = 'authentication', options = {}) {
    if (!app || typeof app.use !== 'function') {
      throw new Error('An application instance has to be passed to the authentication service');
    }

    this.app = app;
    this.strategies = {};
    this.configKey = configKey;

    app.set('defaultAuthentication', app.get('defaultAuthentication') || configKey);
    app.set(configKey, merge({}, app.get(configKey), options));
  }

  /**
   * Return the current configuration from the application
   */
  get configuration() {
    // Always returns a copy of the authentication configuration
    return Object.assign({}, defaultOptions, this.app.get(this.configKey));
  }

  /**
   * A list of all registered strategy names
   */
  get strategyNames() {
    return Object.keys(this.strategies);
  }

  /**
   * Register a new authentication strategy under a given name.
   * @param name The name to register the strategy under
   * @param strategy The authentication strategy instance
   */
  register(name: string, strategy: AuthenticationStrategy) {
    // Call the functions a strategy can implement
    if (typeof strategy.setName === 'function') {
      strategy.setName(name);
    }

    if (typeof strategy.setApplication === 'function') {
      strategy.setApplication(this.app);
    }

    if (typeof strategy.setAuthentication === 'function') {
      strategy.setAuthentication(this);
    }

    if (typeof strategy.verifyConfiguration === 'function') {
      strategy.verifyConfiguration();
    }

    // Register strategy as name
    this.strategies[name] = strategy;
  }

  /**
   * Get the registered authentication strategies for a list of names.
   * The return value may contain `undefined` if the strategy does not exist.
   * @param names The list or strategy names
   */
  getStrategies(...names: string[]) {
    // Returns all strategies for a list of names (including undefined)
    return names.map(name => this.strategies[name])
      .filter(current => !!current);
  }

  /**
   * Create a new JWT with payload and options.
   * @param payload The JWT payload
   * @param optsOverride The options to extend the defaults (`configuration.jwtOptions`) with
   * @param secretOverride Use a different secret instead
   */
  createJWT(payload: string | Buffer | object, optsOverride?: SignOptions, secretOverride?: Secret) {
    const { secret, jwtOptions } = this.configuration;
    // Use configuration by default but allow overriding the secret
    const jwtSecret = secretOverride || secret;
    // Default jwt options merged with additional options
    const options = merge({}, jwtOptions, optsOverride);

    if (!options.jwtid) {
      // Generate a UUID as JWT ID by default
      options.jwtid = uuidv4();
    }

    // @ts-ignore
    return createJWT(payload, jwtSecret, options);
  }

  /**
   * Verifies a JWT.
   * @param accessToken The token to verify
   * @param optsOverride The options to extend the defaults (`configuration.jwtOptions`) with
   * @param secretOverride Use a different secret instead
   */
  verifyJWT(accessToken: string, optsOverride?: JwtVerifyOptions, secretOverride?: Secret) {
    const { secret, jwtOptions } = this.configuration;
    const jwtSecret = secretOverride || secret;
    const options = merge({}, jwtOptions, optsOverride);
    const { algorithm } = options;

    // Normalize the `algorithm` setting into the algorithms array
    if (algorithm && !options.algorithms) {
      options.algorithms = Array.isArray(algorithm) ? algorithm : [ algorithm ];
      delete options.algorithm;
    }

    // @ts-ignore
    return verifyJWT(accessToken, jwtSecret, options);
  }

  /**
   * Authenticate a given authentication request against a list of strategies.
   * @param authentication The authentication request
   * @param params Service call parameters
   * @param allowed A list of allowed strategy names
   */
  async authenticate(authentication: AuthenticationRequest, params: Params, ...allowed: string[]) {
    debug('Running authenticate for strategies', allowed);

    const strategies = this.getStrategies(...allowed)
      .filter(current => current && typeof current.authenticate === 'function');

    if (!authentication || strategies.length === 0) {
      // If there are no valid strategies or `authentication` is not an object
      throw new NotAuthenticated(`No valid authentication strategy available`);
    }

    const { strategy } = authentication;
    const authParams = Object.assign(params, { authentication: true });

    // Throw an error is a `strategy` is indicated but not in the allowed strategies
    if (strategy && !allowed.includes(strategy)) {
      throw new NotAuthenticated(`Invalid authentication strategy '${strategy}'`);
    }

    let error: Error|null = null;

    for (const authStrategy of strategies) {
      try {
        const authResult = await authStrategy.authenticate(authentication, authParams);
        return authResult;
      } catch (currentError) {
        error = error || currentError;
      }
    }

    debug('All strategies error. First error is', error);

    throw error;
  }

  /**
   * Parse an HTTP request and response for authentication request information.
   * @param req The HTTP request
   * @param res The HTTP response
   * @param names A list of strategies to use
   */
  async parse(req: IncomingMessage, res: ServerResponse, ...names: string[]) {
    const strategies = this.getStrategies(...names)
      .filter(current => current && typeof current.parse === 'function');

    if (strategies.length === 0) {
      throw new BadRequest('Authentication HTTP parser needs at least one allowed strategy');
    }

    debug('Strategies parsing HTTP header for authentication information', names);

    for (const authStrategy of strategies) {
      const value = await authStrategy.parse(req, res);

      if (value !== null) {
        return value;
      }
    }

    return null;
  }
}
