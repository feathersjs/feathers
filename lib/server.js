var Proto = require('uberproto');
var _ = require('underscore');
var express = require('express');
var http = require('http');

var Server = Proto.extend({
	init: function (config) {
		var app = express();
		config = config || {};

		this.config = _.extend({
			http: http.createServer(app),
			express: app
		}, config);
		this.services = {};
		this.providers = [];

		// Set Default Attributes
		this.config.express.set('port', process.env.PORT || config.port || 8080);

		// Set Default Middleware
		app.use(express.favicon());
		app.use(express.logger(process.env.NODE_ENV || 'dev'));
		app.use(express.static(__dirname + config.static || '/../public'));
	},


	/*
	 * Express wrapper for .use()
	 */

	// TODO: Maybe we should just extend Express'
	// app.js file and then override or remove what
	// we don't need
	use: function(route, fn){
		this.config.express.use(route, fn);
		return this;
	},

	/*
	 * Express wrapper for .set()
	 */
	set: function(setting, value){
		this.config.express.set(setting, value);
		return this;
	},

	/*
	 * Express wrapper for .get()
	 */
	get: function(setting){
		return this.config.express.get(setting);
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
			this.httpServer = this.config.http.listen(this.config.express.get('port') || 8080);
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
