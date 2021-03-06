import { Service } from '@feathersjs/transport-commons/client';
import { Socket } from 'socket.io-client';
import { defaultEventMap } from '@feathersjs/feathers';

interface SocketIOClientOptions {
    timeout?: number;
}

function socketioClient (connection: Socket, options?: SocketIOClientOptions) {
  if (!connection) {
    throw new Error('Socket.io connection needs to be provided');
  }

  const defaultService = function (this: any, name: string) {
    const events = Object.values(defaultEventMap);
    const settings = Object.assign({}, options, {
      events,
      name,
      connection,
      method: 'emit'
    });

    return new Service(settings);
  };

  const initialize = function (app: any) {
    if (app.io !== undefined) {
      throw new Error('Only one default client provider can be configured');
    }

    app.io = connection;
    app.defaultService = defaultService;
  };

  initialize.Service = Service;
  initialize.service = defaultService;

  return initialize;
}

export = socketioClient;
