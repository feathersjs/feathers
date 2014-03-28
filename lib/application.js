'use strict';

var Proto = require('uberproto');
var _ = require('lodash');

var mixins = require('./mixins');
var stripSlashes = function (name) {
  return name.replace(/^\/|\/$/g, '');
};

module.exports = {
  init: function () {
    _.extend(this, {
      methods: ['find', 'get', 'create', 'update', 'remove'],
      mixins: mixins,
      services: {},
      providers: []
    });
  },

  service: function(location, service) {
    var protoService = Proto.extend(service);
    var self = this;

    location = stripSlashes(location);

    // Add all the mixins
    _.each(this.mixins, function (fn) {
      fn.call(self, protoService);
    });

    // Run the provider functions to register the service
    _.each(this.providers, function (provider) {
      provider(location, protoService);
    });

    this.services[location] = protoService;
    return this;
  },

  use: function (location, service) {

    var hasMethod = function() {
      return _.some(arguments, function(name) {
        return (service && typeof service[name] === 'function');
      });
    };

    // Check for service (any object with at least one service method)
    if(hasMethod('handle', 'set') || !hasMethod.apply(null, this.methods)) {
      return this._super.apply(this, arguments);
    }

    return this.service(location, service);

  },

  lookup: function (location) {
    return this.services[stripSlashes(location)];
  },

  setup: function() {
    // Setup each service (pass the app so that they can look up other services etc.)
    _.each(this.services, function (service, path) {
      if (typeof service.setup === 'function') {
        service.setup(this, path);
      }
    }.bind(this));

    return this;
  },

  listen: function () {
    var server = this._super.apply(this, arguments);
    this.setup(server);
    return server;
  }
};
