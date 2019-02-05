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
  constructor (app, options = {}) {
    const { configKey = 'authentication' } = options;

    this.app = app;
    this.strategies = {};
    this.configKey = configKey;

    app.set(configKey, getOptions(options, app.get(configKey)));

    Object.defineProperty(app, 'authentication', {
      get () {
        return this.get(configKey);
      }
    });
  }

  get configuration () {
    return this.app.authentication;
  }

  get strategyNames () {
    return Object.keys(this.strategies);
  }

  register (name, strategy) {
    if (typeof strategy.setName === 'function') {
      strategy.setName(name);
    }

    if (typeof strategy.setApplication === 'function') {
      strategy.setApplication(this.app);
    }

    if (typeof strategy.setAuthentication === 'function') {
      strategy.setAuthentication(this);
    }

    this.strategies[name] = strategy;
  }

  getStrategies (...names) {
    return names.map(name => this.strategies[name]);
  }

  createJWT (payload, options, _secret) {
    const { secret, jwt } = this.configuration;
    const jwtSecret = _secret || secret;
    const jwtOptions = merge({}, jwt, options);

    if (!jwtOptions.jwtid) {
      jwtOptions.jwtid = uuidv4();
    }

    return createJWT(payload, jwtSecret, jwtOptions);
  }

  verifyJWT (accessToken, options, _secret) {
    const { secret, jwt } = this.configuration;
    const jwtSecret = _secret || secret;
    const jwtOptions = merge({}, jwt, options);
    const { algorithm } = jwtOptions;

    if (algorithm && !jwtOptions.algorithms) {
      jwtOptions.algorithms = Array.isArray(algorithm) ? algorithm : [ algorithm ];
      delete jwtOptions.algorithm;
    }

    return verifyJWT(accessToken, jwtSecret, jwtOptions);
  }

  authenticate (params, ...allowed) {
    const { strategy } = params;

    if (strategy && !allowed.includes(strategy)) {
      return Promise.reject(
        new NotAuthenticated(`Invalid authentication strategy '${strategy}'`)
      );
    }
      
    debug('Running authenticate for strategies', allowed);

    const strategies = this.getStrategies(...allowed)
      .filter(current => current && typeof current.authenticate === 'function');

    if (strategies.length === 0) {
      return Promise.reject(
        new NotAuthenticated(`No valid authentication strategy available`)
      );
    }

    const promise = strategies.reduce((acc, authStrategy) => {
      return acc.then(({ result, error }) => {
        if (!result) {
          return authStrategy.authenticate(params)
            .then(newResult => ({ result: newResult }))
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
    if (names.length === 0) {
      return Promise.reject(
        new BadRequest('Authentication HTTP parser needs at least one allowed strategy')
      );
    }

    const strategies = this.getStrategies(...names)
      .filter(current => current && typeof current.parse === 'function');

    debug('Strategies parsing HTTP header for authentication information', names);

    return strategies.reduce((result, authStrategy) => result.then(val => {
      if (!val) {
        return authStrategy.parse(req, res);
      }

      return val;
    }), Promise.resolve(null));
  }
};
