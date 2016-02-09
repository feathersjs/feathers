import Service from 'feathers-socket-commons/client';

export default function(connection) {
  if(!connection) {
    throw new Error('Primus connection needs to be provided');
  }

  return function() {
    this.primus = connection;
    this.defaultService = function(name) {
      return new Service({ name, connection, method: 'send' });
    };
  };
}
