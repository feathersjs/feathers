'use strict';

var _ = require('lodash');
var express = require('express');
var Proto = require('uberproto');
var Application = require('./application');
var providers = require('./providers');
var errors = require('feathers-errors');

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
  return app;
}

/**
 * Expose `createApplication()`.
 */
module.exports = createApplication;

/**
 * Framework version.
 */
exports.version = require('../package.json').version;

// Add the providers (REST and SocketIO)
_.defaults(module.exports, providers);

// Add the error handling
_.defaults(module.exports, { errors: errors });

// Expose all express methods (like express.engine())
_.defaults(module.exports, express);
