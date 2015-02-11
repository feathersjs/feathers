'use strict';

var _ = require('lodash');
var socketio = require('socket.io');
var Proto = require('uberproto');
var commons = require('./commons');

module.exports = function (config) {
  return function () {
    var app = this;

    app.enable('feathers socketio');

    // Monkey patch app.setup(server)
    Proto.mixin({
      setup: function (server) {
        var self = this;
        var result = this._super.apply(this, arguments);

        if (this.disabled('feathers socketio')) {
          return result;
        }

        var io = this.io = socketio.listen(server);
        // The info object we can pass to commons.setupEventHandler
        this.info = {
          emitters: function() {
            return io.sockets.sockets;
          },
          params: function(socket) {
            return socket.feathers;
          },
          method: 'emit',
          connections: this.connections = this.io.sockets.connected
        };

        // For a new connection, set up the service method handlers
        io.sockets.on('connection', function (socket) {
          // Process services that were registered at startup.
          _.each(self.services, function (service, path) {
            self.setupMethodHandlers.call(self, service, path, socket);
          });
        });

        // Set up events and event dispatching
        _.each(self.services, function (service, path) {
          commons.setupEventHandlers.call(this, service, path);
        }, this);

        if (typeof config === 'function') {
          config.call(this, io);
        }

        return result;
      },

      addService: commons.addService,

      setupMethodHandlers: function(service, path, socket){
        _.each(this.methods, function (method) {
          commons.setupMethodHandler(socket, socket.feathers || {}, service, path, method);
        }, this);
      }
    }, app);
  };
};
