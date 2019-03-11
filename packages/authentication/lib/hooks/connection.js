const debug = require('debug')('@feathersjs/authentication/hooks/connection');

module.exports = (strategy = 'jwt') => {
  return context => {
    const { method, result, params: { connection } } = context;
    const { accessToken, ...rest } = result;

    if (!connection) {
      return context;
    }

    const { authentication = {} } = connection;

    if (method === 'remove' && accessToken === authentication.accessToken) {
      debug('Removing authentication information from real-time connection');
      delete connection.authentication;
    } else if (method === 'create' && accessToken) {
      debug('Adding authentication information to real-time connection');
      Object.assign(connection, rest, {
        authentication: { strategy, accessToken }
      });
    }

    return context;
  };
};
