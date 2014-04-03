'use strict';

var _ = require('lodash');
var socketio = require('socket.io');
var Proto = require('uberproto');

// The position of the params parameters for a service method so that we can extend them
// default is 1
var paramsPositions = {
  find: 0,
  update: 2,
  patch: 2
};

module.exports = function(config) {
  return function() {
    var app = this;
    var services = {};

    app.enable('feathers socketio');

    // Monkey patch app.setup(server)
    Proto.mixin({
      setup: function(server) {
        var self = this;
        var result = this._super.apply(this, arguments);

        if (this.disabled('feathers socketio')) {
          return result;
        }

        var io = this.io = socketio.listen(server);

        _.each(services, function(service, path) {
          // If the service emits events that we want to listen to (Event mixin)
          if (typeof service.on === 'function' && service._serviceEvents) {
            _.each(service._serviceEvents, function(ev) {
              service.on(ev, function(data) {
                io.sockets.emit(path + ' ' + ev, data);
              });
            });
          }
        });

        io.sockets.on('connection', function(socket) {
          _.each(services, function(service, path) {
            _.each(self.methods, function(method) {
              var name = path + '::' + method;
              var position = typeof paramsPositions[method] !== 'undefined' ? paramsPositions[method] : 1;

              if (typeof service[method] === 'function') {
                socket.on(name, function() {
                  var args = _.toArray(arguments);
                  args[position] = _.extend({}, args[position], socket.handshake.feathers);
                  service[method].apply(service, args);
                });
              }
            });
          });
        });

        if (typeof config === 'function') {
          config.call(this, io);
        }

        return result;
      }
    }, app);

    app.providers.push(function(path, service) {
      services[path] = service;
    });
  };
};
