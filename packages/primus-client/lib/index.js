const Service = require('@feathersjs/transport-commons/client');

function primusClient (connection, options) {
  if (!connection) {
    throw new Error('Primus connection needs to be provided');
  }

  const defaultService = function (name) {
    return new Service(Object.assign({}, options, {
      name,
      connection,
      method: 'send'
    }));
  };

  const initialize = function (app) {
    if (typeof app.defaultService === 'function') {
      throw new Error('Only one default client provider can be configured');
    }

    app.primus = connection;
    app.defaultService = defaultService;
  };

  initialize.Service = Service;
  initialize.service = defaultService;

  return initialize;
}

module.exports = primusClient;
module.exports.default = primusClient;
