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
        var info = {
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
          _.each(self.services, function (service, path) {
            _.each(self.methods, function (method) {
              commons.setupMethodHandler(spark, spark.request.feathers, service, path, method);
            });
          });
        });

        // Set up events and event dispatching
        _.each(self.services, function (service, path) {
          // If the service emits events that we want to listen to (Event mixin)
          if (typeof service.on === 'function' && service._serviceEvents) {
            _.each(service._serviceEvents, function (ev) {
              commons.setupEventHandler(info, service, path, ev);
            });
          }
        });

        if (typeof configurer === 'function') {
          configurer.call(this, primus);
        }

        return result;
      }
    }, app);
  };
};
