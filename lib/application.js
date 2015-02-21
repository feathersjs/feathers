'use strict';

var Proto = require('uberproto').extend({
  create: null
});
var _ = require('lodash');

var mixins = require('./mixins');
var stripSlashes = function (name) {
  return name.replace(/^\/|\/$/g, '');
};

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

    // If already _setup, just add this single service.
    if (this._setup) {
      protoService.setup(this, location);
      // If we're using a socket provider, register the service on it.
      if (this.addService) {
        this.addService(protoService, location);
      }
    }

    this.services[location] = protoService;
    return protoService;
  },

  use: function () {
    var args = _.toArray(arguments);
    var location = args.shift();
    var service = args.pop();
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
      middleware: args
    });

    return this;
  },

  setup: function() {
    // Setup each service (pass the app so that they can look up other services etc.)
    _.each(this.services, function (service, path) {
      if (typeof service.setup === 'function') {
        service.setup(this, path);
      }
    }.bind(this));

    this._setup = true;

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
    return server;
  }
};
