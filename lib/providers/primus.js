'use strict';

var _ = require('underscore');
var Proto = require('uberproto');
var Primus = require('primus');
var Emitter = require('primus-emitter');

module.exports = function(config, configurer) {
  return function() {
    var app = this;
    var services = {};

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
        primus.use('emitter', Emitter);

        _.each(services, function(service, path) {
          // If the service emits events that we want to listen to (Event mixin)
          if (typeof service.on === 'function' && service._serviceEvents) {
            _.each(service._serviceEvents, function(ev) {
              service.on(ev, function(data) {
                primus.forEach(function (spark) {
                  spark.send(path + ' ' + ev, data);
                });
              });
            });
          }
        });

        primus.on('connection', function(spark) {
          _.each(services, function(service, path) {
            _.each(self.methods, function(method) {
              var name = path + '::' + method;
              if (service[method]) {
                spark.on(name, service[method].bind(service));
              }
            });
          });
        });

        if (typeof configurer === 'function') {
          configurer.call(this, primus);
        }

        return result;
      }
    }, app);

    app.providers.push(function(path, service) {
      services[path] = service;
    });
  };
};
