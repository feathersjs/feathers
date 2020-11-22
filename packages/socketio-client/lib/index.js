const Service = require('@feathersjs/transport-commons/client');

function socketioClient (connection, options) {
  if (!connection) {
    throw new Error('Socket.io connection needs to be provided');
  }

  if (connection && connection.io && connection.io.engine &&
    connection.io.engine.transport && connection.io.engine.transport.query &&
    connection.io.engine.transport.query.EIO > 3
  ) {
    // tslint:disable-next-line
    console.error('You are trying to use the Socket.io client version 3 or later with Feathers v4 which only supports Socket.io version 2. Please use socket.io-client version 2 instead.');
    throw new Error('socket.io-client must be version 2.x');
  }

  const defaultService = function (name) {
    const events = Object.keys(this.eventMappings || {})
      .map(method => this.eventMappings[method]);

    const settings = Object.assign({}, options, {
      events,
      name,
      connection,
      method: 'emit'
    });

    return new Service(settings);
  };

  const initialize = function (app) {
    if (typeof app.defaultService === 'function') {
      throw new Error('Only one default client provider can be configured');
    }

    app.io = connection;
    app.defaultService = defaultService;
  };

  initialize.Service = Service;
  initialize.service = defaultService;

  return initialize;
}

module.exports = socketioClient;
module.exports.default = socketioClient;
