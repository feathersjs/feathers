import Debug from 'debug';
import setupSocketHandler from './handler';

const debug = Debug('feathers-authentication:sockets');

export function socketio (app, options = {}) {
  debug('Setting up Socket.io authentication middleware with options:', options);

  const providerSettings = {
    provider: 'socketio',
    emit: 'emit',
    disconnect: 'disconnect',
    feathersParams (socket) {
      return socket.feathers;
    }
  };

  return setupSocketHandler(app, options, providerSettings);
}

export function primus (app, options = {}) {
  debug('Setting up Primus authentication middleware with options:', options);

  const providerSettings = {
    provider: 'primus',
    emit: 'send',
    disconnect: 'end',
    feathersParams (socket) {
      return socket.request.feathers;
    }
  };

  return setupSocketHandler(app, options, providerSettings);
}

export default {
  socketio,
  primus
};
