'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

exports.default = function () {
  var mixins = [require('./promise'), require('./event'), require('./normalizer')];

  // Override push to make sure that normalize is always the last
  mixins.push = function () {
    var args = [this.length - 1, 0].concat((0, _from2.default)(arguments));
    this.splice.apply(this, args);
    return this.length;
  };

  return mixins;
};

function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
