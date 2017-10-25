const Debug = require('debug');
const setupSocketHandler = require('./handler');

const debug = Debug('@feathersjs/authentication:sockets');

const socketio = function socketio (app, options = {}) {
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
};

const primus = function primus (app, options = {}) {
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
};

module.exports = {
  socketio,
  primus
};
