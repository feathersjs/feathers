'use strict';

var Proto = require('uberproto');
var _ = require('underscore');

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

  use: function (location, service) {
    var hasServiceMethod = function (name) {
      return typeof service !== 'undefined' && typeof service[name] === 'function';
    };

    // Check for service (any object with at least one service method)
    if (_.some(this.methods, hasServiceMethod)) {
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
    }

    // Pass to the original express app
    return this._super.apply(this, arguments);
  },

  lookup: function (location) {
    return this.services[stripSlashes(location)];
  },

  listen: function () {
    var self = this;
    // Setup each service (pass the app so that they can look up other services etc.)
    _.each(self.services, function (service, path) {
      if (typeof service.setup === 'function') {
        service.setup(self, path);
      }
    });

    return this._super.apply(this, arguments);
  }
};
