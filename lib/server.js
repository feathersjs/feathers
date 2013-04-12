var Proto = require('uberproto');
var _ = require('underscore');
var Server = Proto.extend({
	init: function(configuration) {
		this.configuration = configuration;
		this.services = {};
		this.providers = [];
	},

	service: function(location, service) {
		this.services[location] = service;
		return this;
	},

	use: function(provider) {
		this.providers.push(provider);
		return this;
	},

	start: function() {
		var services = this.services;
		this.providers.forEach(function(provider) {
			_.each(services, function(service, path) {
				provider.register(path, service);
			});
			provider.start();
		});
		return this;
	}
});

exports.Server = Server;
exports.createServer = function(options) {
	return Server.create(options);
}
