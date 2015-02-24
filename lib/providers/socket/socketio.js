'use strict';

var socketio = require('socket.io');
var Proto = require('uberproto');
var commons = require('./commons');

module.exports = function (config) {
  return function () {
    var app = this;

    app.enable('feathers socketio');

    // Monkey patch app.setup(server)
    Proto.mixin({
      service: commons.service,

      setup: function (server) {
        var result = this._super.apply(this, arguments);

        if (this.disabled('feathers socketio')) {
          return result;
        }

        var io = this.io = socketio.listen(server);

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

        if (typeof config === 'function') {
          config.call(this, io);
        }

        return result;
      }
    }, app);
  };
};
