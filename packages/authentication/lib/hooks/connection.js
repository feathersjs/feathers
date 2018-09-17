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
      if (method === 'remove') {
        delete connection.authentication;
      } else if (!connection.authentication) {
        connection.authentication = {
          strategy: 'jwt',
          accessToken
        };
      }
    }

    return context;
  };
};
