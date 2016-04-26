import { getArguments } from 'feathers-commons';
import { errorObject } from './utils';

const debug = require('debug')('feathers-socket-commons:methods');

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
    let connection = info.params(socket);
    let position = typeof paramsPositions[method] !== 'undefined' ?
      paramsPositions[method] : 1;

    socket.on(name, function () {
      debug(`Got '${name}' event with connection`, connection);

      try {
        let args = getArguments(method, arguments);
        let callback = args[args.length - 1];

        args[position] = Object.assign({ query: args[position] }, connection);
        args[args.length - 1] = function(error, data) {
          if(error) {
            debug(`Error calling ${name}`, error);
            return callback(errorObject(error));
          }

          callback(error, data);
        };

        service[method].apply(service, args);
      } catch(e) {
        let callback = arguments[arguments.length - 1];
        debug(`Error on socket`, e);
        if(typeof callback === 'function') {
          callback(errorObject(e));
        }
      }
    });
  });
}
