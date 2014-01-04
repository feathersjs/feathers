'use strict';

var _ = require('underscore');
var socketio = require('socket.io');

module.exports = function (config) {
  return function () {
    var app = this;
    var oldSetup = app.setup;
    var services = {};

    app.enable('feathers socketio');
    // Overwrite Expresss `listen`
    app.setup = function (server) {
      var oldResult = oldSetup.apply(this, arguments);
      if (app.disabled('feathers socketio')) {
        return oldResult;
      }

      var io = this.io = socketio.listen(server);

      _.each(services, function (service, path) {
        // If the service emits events that we want to listen to (Event mixin)
        if (typeof service.on === 'function' && service._serviceEvents) {
          _.each(service._serviceEvents, function (ev) {
            service.on(ev, function (data) {
              io.sockets.emit(path + ' ' + ev, data);
            });
          });
        }
      });

      io.sockets.on('connection', function (socket) {
        _.each(services, function (service, path) {
          _.each(app.methods, function (method) {
            var name = path + '::' + method;
            if (service[method]) {
              socket.on(name, _.bind(service[method], service));
            }
          });
        });
      });

      if(typeof config === 'function') {
        config.call(this, io);
      }

      return oldResult;
    };

    app.providers.push(function (path, service) {
      services[path] = service;
    });
  };
};
