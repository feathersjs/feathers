var Proto = require('uberproto');
var _ = require('underscore');
var path = require('path');
var express = require('express');
var http = require('http');
var mixins = require('./mixins');

var Server = Proto.extend({
	init: function (config) {
		var app = express();
		config = config || {};

		this.config = _.defaults(config, {
			http: http.createServer(app),
			app: app,
			engine: express,
			host: 'localhost',
			port: 8080,
			env: 'dev',
			methods: [ 'find', 'get', 'create', 'update', 'destroy' ],
			// Mixins to add when registering a service.
			// An array of functions that get passed the service object and can do something with it.
			mixins: [
				function(service) {
					service.mixin && service.mixin(mixins.Event);
				},
				function(service) {
					if(typeof service.validate === 'function' && service.mixin) {
						service.mixin(mixins.Validation);
					}
				}
			]
		});

		this.services = {};
		this.providers = [];

		// Set Default Attributes
		this.set('port', process.env.PORT || this.config.port);

		// Set Default Middleware
		// TODO (EK): Abstract this in case we don't want to use express?
		this.use(this.config.engine.favicon());
		this.use(this.config.engine.logger(process.env.NODE_ENV || this.config.env));
	},


	/*
	 * Express wrapper for .use()
	 */

	// TODO (DL): Maybe we should just extend Express'
	// app.js file and then override or remove what
	// we don't need
	use: function(route, fn){
		this.config.app.use(route, fn);
		return this;
	},

	/*
	 * Express wrapper for .set()
	 */
	set: function(setting, value){
		this.config.app.set(setting, value);
		return this;
	},

	/*
	 * Express wrapper for .get()
	 */
	get: function(setting){
		return this.config.app.get(setting);
	},

	service: function (location, service, options) {
		var protoService = Proto.extend(service);

		// Add all the mixins
		_.each(this.config.mixins, function(fn) {
			fn(protoService);
		});

		this.services[location] = protoService;

		return this;
	},

	lookup: function(location) {
		return this.services[location];
	},

	provide: function (provider) {
		this.providers.push(provider);
		return this;
	},

	start: function () {
		var self = this;

		_.each(self.services, function (service, path) {
			if(typeof service.setup === 'function') {
				service.setup(self, path);
			}
		});

		this.providers.forEach(function (provider) {
			_.each(self.services, function (service, path) {
				provider.register(path, service);
			});
			provider.start && provider.start(self);
		});

		this.httpServer = this.config.http.listen(this.config.app.get('port'));

		return this;
	},

	stop: function() {
		var self = this;

		this.providers.forEach(function (provider) {
			provider.stop && provider.stop(self);
		});

		this.httpServer && this.httpServer.close();

		return this;
	}
});

exports.Server = Server;
exports.createServer = function (options) {
	return Server.create(options);
};
