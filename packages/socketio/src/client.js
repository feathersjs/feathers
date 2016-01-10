import Service from 'feathers-commons/lib/sockets/client';

export default function(connection) {
  if(!connection) {
    throw new Error('Socket.io connection needs to be provided');
  }

  return function() {
    this.defaultService = function(name) {
      return new Service({ name, connection, method: 'emit' });
    };
  };
}
