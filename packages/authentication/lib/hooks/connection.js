const debug = require('debug')('@feathersjs/authentication/hooks/connection');

module.exports = (strategy = 'jwt') => {
  return context => {
    const {
      method,
      result: { accessToken },
      params: { provider, connection }
    } = context;

    if (!connection && (provider === 'socketio' || provider === 'primus')) {
      throw new Error(`No connection object found. Please make sure you are using the latest version of '@feathersjs/${provider}' and params.connection is set.`);
    }

    if (connection) {
      const { authentication: { accessToken: currentToken } = {} } = connection;

      if (method === 'remove' && accessToken === currentToken) {
        debug('Removing authentication information from real-time connection');
        delete connection.authentication;
      } else if (method === 'create' && accessToken) {
        debug('Adding authentication information to real-time connection');
        connection.authentication = { strategy, accessToken };
      }
    }

    return context;
  };
};
