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

export interface AuthenticationRequest extends AuthenticationResult {
  strategy?: string;
}

export interface AuthenticationStrategy {
  setAuthentication?(auth: AuthenticationBase): void;
  setApplication?(app: Application): void;
  setName?(name: string): void;
  verifyConfiguration?(): void;
  authenticate(authentication: AuthenticationRequest, params: Params): Promise<AuthenticationResult>;
  parse(req: IncomingMessage, res: ServerResponse): Promise<AuthenticationRequest|null>;
}

export interface StrategyMappings {
  [key: string]: AuthenticationStrategy;
}

export interface JwtVerifyOptions extends VerifyOptions {
  algorithm?: string|string[];
}

export class AuthenticationBase {
  app: Application;
  configKey: string;
  strategies: StrategyMappings;

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

  get configuration() {
    // Always returns a copy of the authentication configuration
    return Object.assign({}, defaultOptions, this.app.get(this.configKey));
  }

  get strategyNames() {
    return Object.keys(this.strategies);
  }

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

  getStrategies(...names: string[]) {
    // Returns all strategies for a list of names (including undefined)
    return names.map(name => this.strategies[name])
      .filter(current => !!current);
  }

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
