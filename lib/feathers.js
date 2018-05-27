'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = createApplication;

var _uberproto = require('uberproto');

var _uberproto2 = _interopRequireDefault(_uberproto);

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a Feathers application that extends Express.
 *
 * @return {Function}
 * @api public
 */
function createApplication (app) {
  _uberproto2.default.mixin(_application2.default, app);
  app.init();
  return app;
}
module.exports = exports['default'];
