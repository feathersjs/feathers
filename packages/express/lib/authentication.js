const { flatten, merge } = require('lodash');
const debug = require('debug')('@feathersjs/express/authentication');

const normalizeStrategy = (_settings = [], ..._strategies) =>
  typeof _settings === 'string'
    ? { strategies: flatten([ _settings, ..._strategies ]) }
    : _settings;

exports.parseAuthentication = (settings = {}) => {
  return function (req, res, next) {
    const { app } = req;
    const service = app.defaultAuthentication ? app.defaultAuthentication(settings.service) : null;

    if (service === null) {
      return next();
    }

    const { authStrategies = [] } = service.configuration;

    if (authStrategies.length === 0) {
      debug('No `authStrategies` found in authentication configuration');
      return next();
    }

    service.parse(req, res, ...authStrategies)
      .then(authentication => {
        if (authentication) {
          debug('Parsed authentication from HTTP header', authentication);
          merge(req, {
            authentication,
            feathers: { authentication }
          });
        }

        next();
      }).catch(next);
  };
};

exports.authenticate = (...strategies) => {
  const settings = normalizeStrategy(...strategies);

  if (!Array.isArray(settings.strategies) || settings.strategies.length === 0) {
    throw new Error(`'authenticate' middleware requires at least one strategy name`);
  }

  return function (req, res, next) {
    const { app, authentication } = req;
    const service = app.defaultAuthentication(settings.service);

    debug('Authenticating with Express middleware and strategies', settings.strategies);

    service.authenticate(authentication, req.feathers, ...settings.strategies)
      .then(authResult => {
        debug('Merging request with', authResult);
        merge(req, authResult);

        next();
      }).catch(next);
  };
};
