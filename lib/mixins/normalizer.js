'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.default = function (service) {
  if (typeof service.mixin === 'function') {
    var mixin = {};

    this.methods.forEach(function (method) {
      if (typeof service[method] === 'function') {
        mixin[method] = function () {
          return this._super.apply(this, (0, _feathersCommons.getArguments)(method, arguments));
        };
      }
    });

    service.mixin(mixin);
  }
};

var _feathersCommons = require('feathers-commons');

module.exports = exports['default'];
