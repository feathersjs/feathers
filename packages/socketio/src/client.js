import Service from 'feathers-socket-commons/client';

export default function(connection) {
  if(!connection) {
    throw new Error('Socket.io connection needs to be provided');
  }

  return function() {
    this.io = connection;
    this.defaultService = function(name) {
      return new Service({ name, connection, method: 'emit' });
    };
  };
}
