import Service from 'feathers-socket-commons/client';

export default function(connection) {
  if(!connection) {
    throw new Error('Socket.io connection needs to be provided');
  }
  
  const defaultService = function(name) {
    return new Service({ name, connection, method: 'emit' });
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
