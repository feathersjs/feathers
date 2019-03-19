const { flatten, merge, omit } = require('lodash');
const { NotAuthenticated } = require('@feathersjs/errors');
const debug = require('debug')('@feathersjs/authentication/hooks/authenticate');

module.exports = (_settings, ..._strategies) => {
  const settings = typeof _settings === 'string'
    ? { strategies: flatten([ _settings, ..._strategies ]) }
    : _settings;

  if (!_settings || settings.strategies.length === 0) {
    throw new Error('The authenticate hook needs at least one allowed strategy');
  }

  return context => {
    const { app, params, type, path, service } = context;
    const {
      service: authPath = app.get('defaultAuthentication'),
      strategies
    } = settings;
    const { provider, authentication } = params;
    const authService = app.service(authPath);

    debug(`Running authenticate hook on '${path}'`);

    if (type && type !== 'before') {
      return Promise.reject(
        new NotAuthenticated('The authenticate hook must be used as a before hook')
      );
    }

    if (!authService || typeof authService.authenticate !== 'function') {
      return Promise.reject(
        new NotAuthenticated(`Could not find authentication service at '${authPath}'`)
      );
    }

    if (service === authService) {
      return Promise.reject(
        new NotAuthenticated('The authenticate hook does not need to be used on the authentication service')
      );
    }

    if (!authentication && provider) {
      return Promise.reject(
        new NotAuthenticated('Not authenticated')
      );
    } else if (authentication && authentication !== true) {
      const authParams = Object.assign({}, params, {
        authentication: true
      });

      debug('Authenticating with', authentication, strategies);

      return authService.authenticate(authentication, authParams, ...strategies)
        .then(authResult => {
          context.params = merge({}, params, omit(authResult, 'accessToken'));

          return context;
        });
    }

    return context;
  };
};
