const { flatten, merge } = require('lodash');
const { NotAuthenticated } = require('@feathersjs/errors');
const debug = require('debug')('@feathersjs/authentication/hooks/authenticate');

module.exports = function authenticate (..._strategies) {
  const strategies = flatten(_strategies);
  
  if (strategies.length === 0) {
    throw new Error('The authenticate hook needs at least one allowed strategy');
  }

  return context => {
    const { app, params, type, data = {}, service, path } = context;
    const { provider } = params;
    const authService = app.authentication || app.service('authentication');
    const isAuthService = authService === service;
    const authentication = isAuthService ? data : params.authentication;

    debug(`Running authenticate hook ${isAuthService && 'on the authentication service'} on ${path}`);

    if (type && type !== 'before') {
      return Promise.reject(
        new NotAuthenticated('The authenticate hook must be used as a `before` hook')
      );
    }

    if (!authService || typeof authService.authenticate !== 'function') {
      return Promise.reject(
        new NotAuthenticated('Could not find valid authentication service for authenticate hook.')
      );
    }

    if (authentication) {
      debug('Authenticating with', authentication, strategies);

      return authService.authenticate(authentication, ...strategies)
        .then(authResult => {
          context.params = merge({}, params, authResult);

          return context;
        });
    } else if (!authentication && provider) {
      return Promise.reject(
        new NotAuthenticated('Not authenticated.')
      );
    }

    return context;
  };
};
