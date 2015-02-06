'use strict';

var _ = require('lodash');
var socketio = require('socket.io');
var Proto = require('uberproto');
var commons = require('./commons');
var eventsMixin = require('../../mixins/event').Mixin;

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
          method: 'emit'
        };

        // For a new connection, set up the service method handlers
        io.sockets.on('connection', function (socket) {
          // Process services that were registered at startup.
          _.each(self.services, function (service, path) {
            self.setupHandlers(service, path, socket);
          });
        });

        // Set up events and event dispatching
        _.each(self.services, function (service, path) {
          self.setupEvents(service, path);
        });

        if (typeof config === 'function') {
          config.call(this, io);
        }

        return result;
      },

      addService: function(service, path){
        var self = this;
        // Add handlers for the service to connected sockets.
        _.each(self.io.sockets.connected, function (socket) {
          self.setupHandlers(service, path, socket);
        });

        // Setup events for the service.
        eventsMixin.applyEvents.call(service);
        this.setupEvents(service, path);
      },

      setupHandlers: function(service, path, socket){
        var self = this;
        _.each(self.methods, function (method) {
          commons.setupMethodHandler(socket, socket.feathers || {}, service, path, method);
        });
      },

      setupEvents: function(service, path){
        var self = this;
        // If the service emits events that we want to listen to (Event mixin)
        if (typeof service.on === 'function' && service._serviceEvents) {
          _.each(service._serviceEvents, function (ev) {
            commons.setupEventHandler(self.info, service, path, ev);
          });
        }
      }
    }, app);
  };
};
