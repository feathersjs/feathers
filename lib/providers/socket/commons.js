var _ = require('lodash');

// The position of the params parameters for a service method so that we can extend them
// default is 1
exports.paramsPositions = {
  find: 0,
  update: 2,
  patch: 2
};

// The default event dispatcher
exports.defaultDispatcher = function (data, params, callback) {
  callback(null, data);
};

// Set up event handlers for a given service using the event dispatching mechanism
exports.setupEventHandlers = function (info, service, path) {
  // If the service emits events that we want to listen to (Event mixin)
  if (typeof service.on === 'function' && service._serviceEvents) {
    var addEvent = function (ev) {
      service.on(ev, function (data) {
        // Check if there is a method on the service with the same name as the event
        var dispatcher = typeof service[ev] === 'function' ?
          service[ev] : exports.defaultDispatcher;
        var eventName = path + ' ' + ev;

        info.clients().forEach(function (socket) {
          dispatcher(data, info.params(socket), function (error, dispatchData) {
            if (error) {
              socket[info.method]('error', error);
            } else if (dispatchData) { // Only dispatch if we have data
              socket[info.method](eventName, dispatchData);
            }
          });
        });
      });
    };

    _.each(service._serviceEvents, addEvent);
  }
};

// Set up all method handlers for a service and socket.
exports.setupMethodHandlers = function (info, socket, service, path) {
  this.methods.forEach(function (method) {
    if (typeof service[method] !== 'function') {
      return;
    }

    var name = path + '::' + method;
    var params = info.params(socket);
    var position = typeof exports.paramsPositions[method] !== 'undefined' ?
      exports.paramsPositions[method] : 1;

    socket.on(name, function () {
      var args = _.toArray(arguments);
      // If the service is called with no parameter object
      // insert an empty object
      if (typeof args[position] === 'function') {
        args.splice(position, 0, {});
      }
      args[position] = _.extend({query: args[position]}, params);
      service[method].apply(service, args);
    });
  });
};

// Common setup functionality taking the info object which abstracts websocket access
exports.setup = function (info) {
  var app = this;
  var setupEventHandlers = exports.setupEventHandlers.bind(this, info);

  app._commons = info;

  // For a new connection, set up the service method handlers
  info.connection().on('connection', function (socket) {
    var setupMethodHandlers = exports.setupMethodHandlers.bind(app, info, socket);
    // Process all registered services
    _.each(app.services, setupMethodHandlers);
  });

  // Set up events and event dispatching
  _.each(app.services, setupEventHandlers);
};

// Socket mixin when a new service is registered
exports.service = function (path, service) {
  var protoService = this._super.apply(this, arguments);
  var info = this._commons;

  // app._socketInfo will only be available once we are set up
  if (service && info) {
    var setupEventHandlers = exports.setupEventHandlers.bind(this, info);
    var setupMethodHandlers = exports.setupMethodHandlers.bind(this, info);

    // Set up event handlers for this new service
    setupEventHandlers(protoService, path);
    // For any existing connection add method handlers
    info.clients().forEach(function (socket) {
      setupMethodHandlers(socket, path, protoService);
    });
  }

  return protoService;
};
