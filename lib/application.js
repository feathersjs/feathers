var Proto = require('uberproto');
var mixins = require('./mixins');
var _ = require('underscore');

exports = module.exports = {
	init: function (config) {
		config = config || {};

		_.extend(this, {
			methods: [ 'find', 'get', 'create', 'update', 'destroy' ],
			mixins: mixins,
			services: {},
			providers: []
		}, _.pick(config, 'methods', 'mixins'));
	},

	service: function (location, service) {
		var protoService = Proto.extend(service);

		// Add all the mixins
		_.each(this.mixins, function(fn) {
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

	listen: function() {
		var httpServer = this._super.apply(this, arguments);
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
			provider.start && provider.start(self, httpServer);
		});

		return httpServer;
	}
};