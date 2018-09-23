module.exports = () => {
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

      if (method === 'remove') {
        if (accessToken === currentToken) {
          delete connection.authentication;
        }
      } else if (method === 'create' && accessToken) {
        connection.authentication = {
          strategy: 'jwt',
          accessToken
        };
      }
    }

    return context;
  };
};
