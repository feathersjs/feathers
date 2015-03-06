import _ from 'lodash';

// The position of the params parameters for a service method so that we can extend them
// default is 1
export const paramsPositions = {
  find: 0,
  update: 2,
  patch: 2
};

// The default event dispatcher
export function defaultDispatcher(data, params, callback) {
  callback(null, data);
}

// Set up event handlers for a given service using the event dispatching mechanism
export function setupEventHandlers(info, service, path) {
  // If the service emits events that we want to listen to (Event mixin)
  if (typeof service.on === 'function' && service._serviceEvents) {
    _.each(service._serviceEvents, ev => {
      service.on(ev, function (data) {
        // Check if there is a method on the service with the same name as the event
        var dispatcher = typeof service[ev] === 'function' ?
          service[ev] : defaultDispatcher;
        var eventName = `${path} ${ev}`;

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
    });
  }
}

// Set up all method handlers for a service and socket.
export function setupMethodHandlers(info, socket, service, path) {
  this.methods.forEach(function (method) {
    if (typeof service[method] !== 'function') {
      return;
    }

    var name = `${path}::${method}`;
    var params = info.params(socket);
    var position = typeof paramsPositions[method] !== 'undefined' ?
      paramsPositions[method] : 1;

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
}
