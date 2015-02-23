'use strict';

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
      service: commons.service,

      setup: function(server) {
        var result = this._super.apply(this, arguments);

        if (this.disabled('feathers primus')) {
          return result;
        }

        var primus = this.primus = new Primus(server, config);

        commons.setup.call(this, {
          method: 'send',
          connection: function() {
            return primus;
          },
          clients: function() {
            return primus;
          },
          params: function(spark) {
            return spark.request.feathers;
          }
        });

        primus.use('emitter', Emitter);

        if (typeof configurer === 'function') {
          configurer.call(this, primus);
        }

        return result;
      }
    }, app);
  };
};
