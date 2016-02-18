'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (service) {
  var _this = this;

  if (typeof service.mixin === 'function') {
    (function () {
      var mixin = {};

      _this.methods.forEach(function (method) {
        if (typeof service[method] === 'function') {
          mixin[method] = wrapper;
        }
      });

      service.mixin(mixin);
    })();
  }
};

function isPromise(result) {
  return typeof result !== 'undefined' && typeof result.then === 'function';
}

function wrapper() {
  var result = this._super.apply(this, arguments);
  var callback = arguments[arguments.length - 1];

  if (typeof callback === 'function' && isPromise(result)) {
    result.then(function (data) {
      return callback(null, data);
    }, function (error) {
      return callback(error);
    });
  }
  return result;
}

module.exports = exports['default'];