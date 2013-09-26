'use strict';

var _ = require('underscore');
var socketio = require('socket.io');
var listen = function (httpServer) {
  var io = socketio.listen(httpServer);

  io.enable('browser client etag');
  io.set('log level', 0);

  io.set('transports', [
    'xhr-polling', 'websocket', 'flashsocket',
    'htmlfile', 'jsonp-polling'
  ]);

  return io;
};

module.exports = function (config) {
  return function () {
    var app = this;
    var oldListen = app.listen;
    var services = {};

    app.enable('feathers socketio');
    // Overwrite Expresss `listen`
    app.listen = function () {
      var httpServer = oldListen.apply(this, arguments);
      if (app.disabled('feathers socketio')) {
        return httpServer;
      }

      var io = this.io = listen(httpServer);

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

      return httpServer;
    };

    app.providers.push(function (path, service) {
      services[path] = service;
    });
  };
};
