import getArguments from '../arguments';
import { each } from '../utils';

function errorObject(e) {
  let result = {};
  Object.getOwnPropertyNames(e).forEach(key => result[key] = e[key]);
  return result;
}

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
  if (typeof service.on !== 'function' || !service._serviceEvents) {
    return;
  }

  each(service._serviceEvents, ev => {
    service.on(ev, function (data) {
      // Check if there is a method on the service with the same name as the event
      let dispatcher = typeof service[ev] === 'function' ?
        service[ev] : defaultDispatcher;
      let eventName = `${path} ${ev}`;

      info.clients().forEach(function (socket) {
        dispatcher.call(service, data, info.params(socket), function (error, dispatchData) {
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

// Set up all method handlers for a service and socket.
export function setupMethodHandlers(info, socket, service, path) {
  this.methods.forEach(function (method) {
    if (typeof service[method] !== 'function') {
      return;
    }

    let name = `${path}::${method}`;
    let params = info.params(socket);
    let position = typeof paramsPositions[method] !== 'undefined' ?
      paramsPositions[method] : 1;

    socket.on(name, function () {
      try {
        let args = getArguments(method, arguments);
        args[position] = Object.assign({ query: args[position] }, params);
        service[method].apply(service, args);
      } catch(e) {
        let callback = arguments[arguments.length - 1];
        if(typeof callback === 'function') {
          callback(errorObject(e));
        }
      }
    });
  });
}
