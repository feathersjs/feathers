'use strict';

var _ = require('lodash');
var Proto = require('uberproto');
var Primus = require('primus');
var Emitter = require('primus-emitter');
var commons = require('./commons');

module.exports = function(config, configurer) {
  return function() {
    var app = this;

    app.enable('feathers primus');

    // Monkey patch app.setup(server)
    Proto.mixin({
      setup: function(server) {
        var self = this;
        var result = this._super.apply(this, arguments);

        if (this.disabled('feathers primus')) {
          return result;
        }

        var primus = this.primus = new Primus(server, config);
        this.info = {
          emitters: function() {
            return primus;
          },
          params: function(spark) {
            return spark.request.feathers;
          },
          method: 'send',
          connections: this.primus.connections
        };

        primus.use('emitter', Emitter);

        // For a new connection, set up the service method handlers
        primus.on('connection', function (spark) {
          // Process services that were registered at startup.
          _.each(self.services, function (service, path) {
            self.setupMethodHandlers.call(self, service, path, spark);
          });
        });

        // Set up events and event dispatching
        _.each(this.services, function (service, path) {
          commons.setupEventHandlers.call(this, service, path);
        }, this);

        if (typeof configurer === 'function') {
          configurer.call(this, primus);
        }

        return result;
      },

      addService: commons.addService,

      setupMethodHandlers: function(service, path, spark){
        _.each(this.methods, function (method) {
          commons.setupMethodHandler(spark, spark.request.feathers, service, path, method);
        }, this);
      }
    }, app);
  };
};
