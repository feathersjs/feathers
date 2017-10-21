const debug = require('debug')('@feathersjs/socket-commons');
const channels = require('./channels');
const { getDispatcher, runMethod } = require('./utils');

module.exports = function ({ done, emit, socketKey, getParams }) {
  return function () {
    const app = this;

    // Event dispatching (through `feathers-channels`)
    app.configure(channels());
    app.on('publish', getDispatcher(emit, socketKey));

    // `connection` event
    done.then(provider => provider.on('connection', socket =>
      app.emit('connection', getParams(socket)))
    );

    // `socket.emit('methodName', 'serviceName', ...args)` handlers
    done.then(provider => provider.on('connection', socket => {
      for (let method of app.methods) {
        socket.on(method, (...args) => {
          const path = args.shift();

          debug(`Got '${method}' call for service '${path}'`);
          runMethod(app, getParams(socket), path, method, args);
        });
      }
    }));

    // Legacy `socket.emit('serviceName::methodName', ...args)` handlers
    app.mixins.push((service, path) => done.then(provider => {
      provider.on('connection', socket => {
        const methods = app.methods.filter(current =>
          typeof service[current] === 'function'
        );

        for (let method of methods) {
          const eventName = `${path}::${method}`;

          socket.on(eventName, (...args) => {
            debug(`Got legacy method call '${eventName}'`);
            runMethod(app, getParams(socket), path, method, args);
          });
        }
      });
    }));
  };
};
