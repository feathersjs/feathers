var server = require('./server');
var _ = require('underscore');
var providers = require('./providers');
var services = require('./services');

exports.errors = require('./errors');
exports.Server = server.Server;
exports.createServer = server.createServer;

_.each(providers, function(Provider, name) {
	exports[name] = function(options) {
		return Provider.create(options);
	};
});

_.each(services, function(Service, name) {
  exports[name] = function(options) {
    // TODO: Fix this! Can't call create because UberProto
    // calls create which we are overriding in our service
    return Service.create(options);
  };
});
