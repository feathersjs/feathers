import { Service } from '@feathersjs/transport-commons/src/client';
import { Socket } from 'socket.io-client';

export interface SocketIOClientOptions {
    timeout?: number;
}

export default function socketioClient (connection: Socket, options?: SocketIOClientOptions) {
  if (!connection) {
    throw new Error('Socket.io connection needs to be provided');
  }

  const defaultService = function (this: any, name: string) {
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

  const initialize = function (app: any) {
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

if (typeof module !== 'undefined') {
  module.exports = Object.assign(socketioClient, module.exports);
}
