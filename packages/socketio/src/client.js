import Service from 'feathers-socket-commons/client';

export default function(connection, options) {
  if(!connection) {
    throw new Error('Socket.io connection needs to be provided');
  }

  const defaultService = function(name) {
    const settings = Object.assign({}, options, {
      name,
      connection,
      method: 'emit'
    });

    return new Service(settings);
  };

  const initialize = function() {
    if(typeof this.defaultService === 'function') {
      throw new Error('Only one default client provider can be configured');
    }

    this.io = connection;
    this.defaultService = defaultService;
  };

  initialize.Service = Service;
  initialize.service = defaultService;

  return initialize;
}
