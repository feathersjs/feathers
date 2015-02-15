'use strict';

var _ = require('lodash');
var eventsMixin = require('../../mixins/event').Mixin;

// The position of the params parameters for a service method so that we can extend them
// default is 1
var paramsPositions = {
  find: 0,
  update: 2,
  patch: 2
};

exports.addService = function addService(service, path){
  // Add handlers for the service to connected sockets.
  _.each(this.info.connections, function (spark) {
    this.setupMethodHandlers(service, path, spark);
  }, this);

  // Setup events for the service.
  eventsMixin.applyEvents.call(service);
  exports.setupEventHandlers.call(this, service, path);
};

// Set up the service method handler for a service and socket.
exports.setupMethodHandler = function setupMethodHandler(emitter, params, service, path, method) {
  var name = path + '::' + method;
  var position = typeof paramsPositions[method] !== 'undefined' ? paramsPositions[method] : 1;

  if (typeof service[method] === 'function') {
    emitter.on(name, function () {
      var args = _.toArray(arguments);
      // If the service is called with no parameter object
      // insert an empty object
      if(typeof args[position] === 'function') {
        args.splice(position, 0, {});
      }

      // If no callback was provided...
      if (typeof args[args.length - 1] !== 'function') {
        // ... create one that logs errors for the developer.
        var callback = function(err){
          if (err) {
            console.log('Error on ' + path + '::' + method, args, err);
          }
        };
        args.push(callback);
      }

      args[position] = _.extend({ query: args[position] }, params);
      service[method].apply(service, args);
    });
  }
};

exports.setupEventHandlers = function setupEventHandlers(service, path){
  // If the service emits events that we want to listen to (Event mixin)
  if (typeof service.on === 'function' && service._serviceEvents) {
    _.each(service._serviceEvents, function (ev) {
      exports.setupEventHandler(this.info, service, path, ev);
    }, this);
  }
};

// Set up event handlers for a given service and connected sockets.
// Send it through the service dispatching mechanism (`removed(data, params, callback)`,
// `updated(data, params, callback)` and `created(data, params, callback)`) if it
// exists.
exports.setupEventHandler = function setupEventHandler (info, service, path, ev) {
  var defaultDispatcher = function (data, params, callback) {
    callback(null, data);
  };

  service.on(ev, function (data) {
    // Check if there is a method on the service with the same name as the event
    var dispatcher = typeof service[ev] === 'function' ? service[ev] : defaultDispatcher;
    var eventName = path + ' ' + ev;

    info.emitters().forEach(function (emitter) {
      dispatcher(data, info.params(emitter), function (error, dispatchData) {
        if (error) {
          emitter[info.method]('error', error);
        } else if (dispatchData) {
          emitter[info.method](eventName, dispatchData);
        }
      });
    });
  });
};
