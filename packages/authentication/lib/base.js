const { promisify } = require('util');
const { merge } = require('lodash');
const jsonwebtoken = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const { NotAuthenticated, BadRequest } = require('@feathersjs/errors');

const getOptions = require('./options');
const debug = require('debug')('@feathersjs/authentication/base');
const createJWT = promisify(jsonwebtoken.sign);
const verifyJWT = promisify(jsonwebtoken.verify);

module.exports = class AuthenticationBase {
  constructor (app, configKey = 'authentication', options = {}) {
    this.app = app;
    this.strategies = {};
    this.configKey = configKey;

    app.set('defaultAuthentication', app.get('defaultAuthentication') || configKey);
    app.set(configKey, getOptions(options, app.get(configKey)));
  }

  get configuration () {
    // Always returns a copy of the authentication configuration
    return merge({}, this.app.get(this.configKey));
  }

  get strategyNames () {
    return Object.keys(this.strategies);
  }

  register (name, strategy) {
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

    // Register strategy as name
    this.strategies[name] = strategy;
  }

  getStrategies (...names) {
    // Returns all strategies for a list of names (including undefined)
    return names.map(name => this.strategies[name]);
  }

  createJWT (payload, _options, _secret) {
    const { secret, jwtOptions } = this.configuration;
    // Use configuration by default but allow overriding the secret
    const jwtSecret = _secret || secret;
    // Default jwt options merged with additional options
    const options = merge({}, jwtOptions, _options);

    if (!options.jwtid) {
      // Generate a UUID as JWT ID by default
      options.jwtid = uuidv4();
    }

    return createJWT(payload, jwtSecret, options);
  }

  verifyJWT (accessToken, _options, _secret) {
    const { secret, jwtOptions } = this.configuration;
    const jwtSecret = _secret || secret;
    const options = merge({}, jwtOptions, _options);
    const { algorithm } = options;

    // Normalize the `algorithm` setting into the algorithms array
    if (algorithm && !options.algorithms) {
      options.algorithms = Array.isArray(algorithm) ? algorithm : [ algorithm ];
      delete options.algorithm;
    }

    return verifyJWT(accessToken, jwtSecret, options);
  }

  authenticate (authentication, params, ...allowed) {
    debug('Running authenticate for strategies', allowed);

    const strategies = this.getStrategies(...allowed)
      .filter(current => current && typeof current.authenticate === 'function');

    if (!authentication || strategies.length === 0) {
      // If there are no valid strategies or `authentication` is not an object
      return Promise.reject(
        new NotAuthenticated(`No valid authentication strategy available`)
      );
    }

    const { strategy } = authentication;

    // Throw an error is a `strategy` is indicated but not in the allowed strategies
    if (strategy && !allowed.includes(strategy)) {
      return Promise.reject(
        new NotAuthenticated(`Invalid authentication strategy '${strategy}'`)
      );
    }

    // Run all strategies and accumulate results and errors
    const promise = strategies.reduce((acc, authStrategy) => {
      return acc.then(({ result, error }) => {
        if (!result) {
          return authStrategy.authenticate(authentication, params)
            // Set result
            .then(newResult => ({ result: newResult }))
            // Use caught error or previous error if it already exists
            .catch(newError => ({ error: error || newError }));
        }

        return { result, error };
      });
    }, Promise.resolve({}));

    return promise.then(({ result, error }) => {
      if (error) {
        debug('All strategies error. First error is', error);

        throw error;
      }

      return result;
    });
  }

  parse (req, res, ...names) {
    const strategies = this.getStrategies(...names)
      .filter(current => current && typeof current.parse === 'function');

    if (strategies.length === 0) {
      return Promise.reject(
        new BadRequest('Authentication HTTP parser needs at least one allowed strategy')
      );
    }

    debug('Strategies parsing HTTP header for authentication information', names);

    // Call `parse` for all strategies and use the first one that didn't return `null`
    return strategies.reduce((result, authStrategy) => result.then(val => {
      if (!val) {
        return authStrategy.parse(req, res);
      }

      return val;
    }), Promise.resolve(null));
  }
};
