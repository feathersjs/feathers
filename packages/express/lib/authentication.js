const { flatten, merge } = require('lodash');
const { BadRequest } = require('@feathersjs/errors');

const normalizeStrategy = (_settings = [], ..._strategies) =>
  typeof _settings === 'string'
    ? { strategies: flatten([ _settings, ..._strategies ]) }
    : _settings;
const getService = (settings, app) => {
  const path = settings.service || app.get('defaultAuthentication');
  const service = app.service(path);

  if (!service) {
    throw new BadRequest(`Could not find authentication service '${path}'`);
  }

  return service;
};

exports.parseAuthentication = (...strategies) => {
  const settings = normalizeStrategy(...strategies);

  if (!Array.isArray(settings.strategies) || settings.strategies.length === 0) {
    throw new Error(`'parseAuthentication' middleware requires at least one strategy name`);
  }

  return function (req, res, next) {
    const { app } = req;
    const service = getService(settings, app);

    service.parse(req, res, ...settings.strategies)
      .then(authentication => {
        merge(req, {
          authentication,
          feathers: { authentication }
        });

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
    const service = getService(settings, app);

    service.authenticate(authentication, req.feathers, ...settings.strategies)
      .then(authResult => {
        merge(req, authResult);

        next();
      }).catch(next);
  };
};
