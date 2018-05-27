'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = createApplication;

var _feathers = require('../feathers');

var _feathers2 = _interopRequireDefault(_feathers);

var _express = require('./express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createApplication () {
  return (0, _feathers2.default)(_express2.default.apply(undefined, arguments));
}

createApplication.version = '2.0.1';
module.exports = exports['default'];
