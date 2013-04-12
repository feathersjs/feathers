var server = require('./server');
var _ = require('underscore');
var providers = {
	rest: require('./providers/rest')
}

exports.Server = server.Server;
exports.createServer = server.createServer;

_.each(providers, function(Provider, name) {
	exports[name] = function(options) {
		return Provider.create(options);
	}
});
