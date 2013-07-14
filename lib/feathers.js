var server = require('./server');
var _ = require('underscore');
var providers = require('./providers');
var services = require('./services');
var Proto = require('uberproto');

exports.errors = require('./errors');
exports.Server = server.Server;
exports.createServer = server.createServer;
var service = exports.service = {};

_.each(providers, function(Provider, name) {
	exports[name] = function(options) {
		return Provider.create(options);
	};
});

_.each(services, function(Service, name) {
  service[name] = function(options) {
    return Proto.create.call(Service, options);
  };

  service[name].Service = Service;
});
