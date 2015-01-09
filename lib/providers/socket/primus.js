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
          method: 'send'
        };

        primus.use('emitter', Emitter);

        // For a new connection, set up the service method handlers
        primus.on('connection', function (spark) {
          // Process services that were registered at startup.
          _.each(self.services, function (service, path) {
            self.setupHandlers(service, path, spark);
          });
        });

        // Set up events and event dispatching
        _.each(self.services, function (service, path) {
          self.setupEvents(service, path);
        });

        if (typeof configurer === 'function') {
          configurer.call(this, primus);
        }

        return result;
      },

      addService: function(service, path){
        var self = this;
        // Add handlers for the service to connected sockets.
        _.each(self.primus.connections, function (spark) {
          self.setupHandlers(service, path, spark);
        });
        // Setup events for the service.
        this.setupEvents(service, path);
      },

      setupHandlers: function(service, path, spark){
        var self = this;
        _.each(self.methods, function (method) {
          commons.setupMethodHandler(spark, spark.request.feathers, service, path, method);
        });
      },

      setupEvents: function(service, path){
        var self = this;
        // If the service emits events that we want to listen to (Event mixin)
        if (typeof service.on === 'function' && service._serviceEvents) {
          _.each(service._serviceEvents, function (ev) {
            commons.setupEventHandler(self.info, service, path, ev);
          });
        }
      }
    }, app);
  };
};
