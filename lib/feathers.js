'use strict';

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
  // Add REST provider by default, can always be disabled using app.disable('feathers rest')
  app.use(express.urlencoded()).use(express.json()).configure(providers.rest());
  return app;
}

/**
 * Expose `createApplication()`.
 */
module.exports = createApplication;

/**
 * Framework version.
 */
module.exports.version = require('../package.json').version;

// Add the providers (REST and SocketIO)
_.defaults(module.exports, providers);

// Expose all express methods (like express.static())
_.defaults(module.exports, express);
