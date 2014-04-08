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

// Set up the service method handlers for a service and socket.
function setupMethodHandler (socket, service, path, method) {
  var name = path + '::' + method;
  var position = typeof paramsPositions[method] !== 'undefined' ? paramsPositions[method] : 1;

  if (typeof service[method] === 'function') {
    socket.on(name, function () {
      var args = _.toArray(arguments);
      args[position] = _.extend({}, args[position], socket.handshake.feathers);
      service[method].apply(service, args);
    });
  }
}

// Set up event handlers for a given service and connected sockets.
// Send it through the service dispatching mechanism (`removed(data, params, callback)`,
// `updated(data, params, callback)` and `created(data, params, callback)`) if it
// exists.
function setupEventHandler (sockets, service, path, ev) {
  var defaultDispatcher = function (data, params, callback) {
    callback(null, data);
  };

  service.on(ev, function (data) {
    // Check if there is a method on the service with the same name as the event
    var dispatcher = typeof service[ev] === 'function' ? service[ev] : defaultDispatcher;
    var eventName = path + ' ' + ev;

    sockets.clients().forEach(function (socket) {
      dispatcher(data, socket.handshake.feathers, function (error, dispatchData) {
        if (error) {
          socket.emit('error', error);
        } else if (dispatchData) {
          socket.emit(eventName, dispatchData);
        }
      });
    });
  });
}

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

        // For a new connection, set up the service method handlers
        io.sockets.on('connection', function (socket) {
          _.each(self.services, function (service, path) {
            _.each(self.methods, function (method) {
              setupMethodHandler(socket, service, path, method);
            });
          });
        });

        // Set up events and event dispatching
        _.each(self.services, function (service, path) {
          // If the service emits events that we want to listen to (Event mixin)
          if (typeof service.on === 'function' && service._serviceEvents) {
            _.each(service._serviceEvents, function (ev) {
              setupEventHandler(io.sockets, service, path, ev);
            });
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
