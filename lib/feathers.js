var _ = require('underscore');
var express = require('express');
var Proto = require('uberproto');

var providers = require('./providers');
var services = require('./services');
var Application = require('./application');

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */
function createApplication(config) {
	var app = express();
	Proto.mixin(Application, app);
	app.init(config);
	return app;
}

/**
 * Expose `createApplication()`.
 */
exports = module.exports = createApplication;

/**
 * Framework version.
 */
exports.version = require('../package.json').version;

exports.errors = require('./errors');
exports.services = {};

_.each(providers, function(Provider, name) {
	exports[name] = function(options) {
		return Provider.create(options);
	};
});

_.each(services, function(Service, name) {
	exports.services[name] = function(options) {
		return Proto.create.call(Service, options);
	};

	exports.services[name].Service = Service;
});
