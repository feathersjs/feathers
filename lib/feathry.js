var server = require('./server');
var _ = require('underscore');
var providers = require('./providers');

exports.errors = require('./errors');
exports.Server = server.Server;
exports.createServer = server.createServer;

_.each(providers, function(Provider, name) {
	exports[name] = function(options) {
		return Provider.create(options);
	}
});
