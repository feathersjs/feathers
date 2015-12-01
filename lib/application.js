'use strict';

var _ = require('lodash');
var debug = require('debug')('feathers:application');
var stripSlashes = require('feathers-commons').stripSlashes;
var Proto = require('uberproto').extend({
  create: null
});
var mixins = require('./mixins');


module.exports = {
  init: function () {
    _.extend(this, {
      methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
      mixins: mixins(),
      services: {},
      providers: [],
      _setup: false
    });
  },

  service: function(location, service, options) {
    location = stripSlashes(location);

    if(!service) {
      return this.services[location];
    }

    var protoService = Proto.extend(service);
    var self = this;

    debug('Registering new service at `' + location + '`');

    // Add all the mixins
    _.each(this.mixins, function (fn) {
      fn.call(self, protoService);
    });

    if(typeof protoService._setup === 'function') {
      protoService._setup(this, location);
    }

    // Run the provider functions to register the service
    _.each(this.providers, function (provider) {
      provider(location, protoService, options || {});
    });

    // If we ran setup already, set this service up explicitly
    if (this._isSetup && typeof protoService.setup === 'function') {
      debug('Setting up service for `' + location + '`');
      protoService.setup(this, location);
    }

    this.services[location] = protoService;
    return protoService;
  },

  use: function (location) {
    var service, middleware = _(arguments)
      .slice(1)
      .reduce(function (middleware, arg) {
        if (typeof arg === 'function') {
          middleware[service ? 'after' : 'before'].push(arg);
        } else if (!service) {
          service = arg;
        } else {
          throw new Error('invalid arg passed to app.use');
        }
        return middleware;
      }, {
        before: [],
        after: []
      });
    var hasMethod = function(methods) {
      return _.some(methods, function(name) {
        return (service && typeof service[name] === 'function');
      });
    };

    // Check for service (any object with at least one service method)
    if(hasMethod(['handle', 'set']) || !hasMethod(this.methods)) {
      return this._super.apply(this, arguments);
    }

    this.service(location, service, {
      // Any arguments left over are other middleware that we want to pass to the providers
      middleware: middleware
    });

    return this;
  },

  setup: function() {
    // Setup each service (pass the app so that they can look up other services etc.)
    _.each(this.services, function (service, path) {
      debug('Setting up service for `' + path + '`');
      if (typeof service.setup === 'function') {
        service.setup(this, path);
      }
    }.bind(this));

    this._isSetup = true;

    return this;
  },

  // Express 3.x configure is gone in 4.x but we'll keep a more basic version
  // That just takes a function in order to keep Feathers plugin configuration easier.
  // Environment specific configurations should be done as suggested in the 4.x migration guide:
  // https://github.com/visionmedia/express/wiki/Migrating-from-3.x-to-4.x
  configure: function(fn){
    fn.call(this);

    return this;
  },

  listen: function () {
    var server = this._super.apply(this, arguments);
    this.setup(server);
    debug('Feathers application listening');
    return server;
  }
};
