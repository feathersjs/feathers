const debug = require('debug')('feathers-express');
const express = require('express');
const Proto = require('uberproto');

module.exports = function feathersExpress (feathersApp) {
  const expressApp = express();
  const mixin = {
    use (location) {
      let service;
      let middleware = Array.from(arguments)
        .slice(1)
        .reduce(function (middleware, arg) {
          if (typeof arg === 'function') {
            middleware[service ? 'after' : 'before'].push(arg);
          } else if (!service) {
            service = arg;
          } else {
            throw new Error('Invalid options passed to app.use');
          }
          return middleware;
        }, {
          before: [],
          after: []
        });

      const hasMethod = methods => methods.some(name =>
        (service && typeof service[name] === 'function')
      );

      // Check for service (any object with at least one service method)
      if (hasMethod(['handle', 'set']) || !hasMethod(this.methods.concat('setup'))) {
        debug('Passing app.use call to Express app');
        return this._super.apply(this, arguments);
      }

      debug('Registering service with middleware', middleware);
      // Since this is a serivce, call Feathers `.use`
      feathersApp.use.call(this, location, service, { middleware });

      return this;
    },

    listen () {
      const server = this._super.apply(this, arguments);

      this.setup(server);
      debug('Feathers application listening');

      return server;
    }
  };

  Object.getOwnPropertyNames(feathersApp).forEach(prop => {
    if (typeof mixin[prop] === 'undefined' && typeof expressApp[prop] === 'undefined') {
      Object.defineProperty(mixin, prop,
        Object.getOwnPropertyDescriptor(feathersApp, prop)
      );
    }
  });

  return Proto.mixin(mixin, expressApp);
};
