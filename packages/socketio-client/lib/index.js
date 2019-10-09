const Service = require('@feathersjs/transport-commons/client');

function socketioClient (connection, options) {
  if (!connection) {
    throw new Error('Socket.io connection needs to be provided');
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
