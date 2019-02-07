const { flatten, merge } = require('lodash');
const { NotAuthenticated } = require('@feathersjs/errors');
const debug = require('debug')('@feathersjs/authentication/hooks/authenticate');

module.exports = (..._strategies) => {
  const strategies = flatten(_strategies);
  
  if (strategies.length === 0) {
    throw new Error('The authenticate hook needs at least one allowed strategy');
  }

  return context => {
    const { app, params, type, path, service } = context;
    const { provider, authentication } = params;
    const authService = app.service(app.authentication.path);

    debug(`Running authenticate hook on '${path}'`);

    if (type && type !== 'before') {
      return Promise.reject(
        new NotAuthenticated('The authenticate hook must be used as a before hook')
      );
    }

    if (service === authService) {
      return Promise.reject(
        new NotAuthenticated('The authenticate hooks should not be used on the authentication service')
      );
    }

    if (!authService || typeof authService.authenticate !== 'function') {
      return Promise.reject(
        new NotAuthenticated(`Could not find authentication service at '${app.authentication.path}'`)
      );
    }

    if (authentication) {
      debug('Authenticating with', authentication, strategies);

      return authService.authenticate(authentication, params, ...strategies)
        .then(authResult => {
          context.params = merge({}, params, authResult);

          return context;
        });
    } else if (!authentication && provider) {
      return Promise.reject(
        new NotAuthenticated('Not authenticated')
      );
    }

    return context;
  };
};
