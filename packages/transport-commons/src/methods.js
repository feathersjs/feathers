import { getArguments } from 'feathers-commons';
import { errorObject } from './utils';

// The position of the params parameters for a service method so that we can extend them
// default is 1
export const paramsPositions = {
  find: 0,
  update: 2,
  patch: 2
};

// Set up all method handlers for a service and socket.
export function setupMethodHandlers(info, socket, path, service) {
  this.methods.forEach(method => {
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
