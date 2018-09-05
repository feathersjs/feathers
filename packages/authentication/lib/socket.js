const debug = require('debug')('@feathersjs/authentication:sockets');
const { NotImplemented } = require('@feathersjs/errors');

module.exports = function legacySocketHandler () {
  return socket => {
    socket.on('authenticate', (data, callback) => {
      debug('Got legacy authenticate socket event, sending back error');
      callback(new NotImplemented('Invalid socket authentication mechanism. Please upgrade to the latest client.'));
    });
    socket.on('logout', callback => {
      debug('Got legacy logout socket event, sending back error');
      callback(new NotImplemented('Invalid logout mechanism. Please upgrade to the latest client.'));
    });
  };
};
