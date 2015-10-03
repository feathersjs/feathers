'use strict';

var socketio = require('socket.io');
var Proto = require('uberproto');
var debug = require('debug')('feathers:socket.io');
var commons = require('feathers-commons').socket;

module.exports = function (config) {
  return function () {
    var app = this;

    app.enable('feathers socketio');

    // Monkey patch app.setup(server)
    Proto.mixin({
      service: commons.service,

      setup: function (server) {
        if (this.disabled('feathers socketio')) {
          return this._super.apply(this, arguments);
        }

        var io = this.io = socketio.listen(server);

        if (typeof config === 'function') {
          debug('Calling SocketIO configuration function');
          config.call(this, io);
        }

        var result = this._super.apply(this, arguments);

        debug('Setting up SocketIO');

        commons.setup.call(this, {
          method: 'emit',
          connection: function() {
            return io.sockets;
          },
          clients: function() {
            return io.sockets.sockets;
          },
          params: function(socket) {
            return socket.feathers;
          }
        });

        return result;
      }
    }, app);
  };
};
