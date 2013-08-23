var _ = require('underscore');
var express = require('express');
var Proto = require('uberproto');
var Application = require('./application');
var providers = require('./providers');

/**
 * Create a Feathers application that extends Express.
 *
 * @return {Function}
 * @api public
 */
function createApplication() {
	var app = express();
	Proto.mixin(Application, app);
	app.init();
	// Add REST provider by default, can always be disabled
	// using app.disable('feathers rest')
	app.configure(providers.rest);
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

// Expose all errors
exports.errors = require('./errors');

// Expose all included service
exports.services = require('./services');

// Add the providers (REST and SocketIO)
_.defaults(exports, providers);

// Expose all express methods (like express.static())
_.defaults(exports, express);
