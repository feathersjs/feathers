'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return (0, _feathers2.default)((0, _express2.default)());
};

var _feathers = require('../feathers');

var _feathers2 = _interopRequireDefault(_feathers);

var _express = require('./express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];