var Proto = require('uberproto');
var _ = require('underscore');
var express = require('express');
var http = require('http');

var Server = Proto.extend({
	init: function (configuration) {
		var app = express();
		app.use(express.static(__dirname + '/../public'));
		this.configuration = _.extend({
			http: http.createServer(app),
			express: app
		}, configuration);
		this.services = {};
		this.providers = [];
	},

	service: function (location, service) {
		this.services[location] = service;
		return this;
	},

	lookup: function(location) {
		return this.services[location];
	},

	provide: function (provider) {
		this.providers.push(provider);
		return this;
	},

	http: function() {
		if(!this.httpServer) {
			this.httpServer = this.configuration.http.listen(this.configuration.port);
		}
		return this.httpServer;
	},

	start: function () {
		var self = this;

		_.each(self.services, function (service) {
			if(typeof service.setup === 'function') {
				service.setup(self);
			}
		});

		this.providers.forEach(function (provider) {
			_.each(self.services, function (service, path) {
				provider.register(path, service);
			});
			provider.start(self);
		});

		return this;
	}
});

exports.Server = Server;
exports.createServer = function (options) {
	return Server.create(options);
};
