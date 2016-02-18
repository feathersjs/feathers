'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createApplication;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _uberproto = require('uberproto');

var _uberproto2 = _interopRequireDefault(_uberproto);

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

/**
 * Create a Feathers application that extends Express.
 *
 * @return {Function}
 * @api public
 */
function createApplication() {
  var app = arguments.length <= 0 || arguments[0] === undefined ? (0, _express2.default)() : arguments[0];

  _uberproto2.default.mixin(_application2.default, app);
  app.init();
  app.errors = _feathersErrors2.default;
  return app;
}

// Framework version
createApplication.version = require('../package.json').version;

// Expose all express methods (like express.engine())
Object.assign(createApplication, _express2.default);
module.exports = exports['default'];