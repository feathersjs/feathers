'use strict';

var _ = require('lodash');

var wrapper = function () {
  var result = this._super.apply(this, arguments);
  var callback = arguments[arguments.length - 1];

  if(typeof result !== 'undefined' && _.isFunction(result.then) && _.isFunction(callback)) {
    result.then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error);
    });
  }
  return result;
};

module.exports = function (service) {
  if (typeof service.mixin === 'function') {
    var mixin = {};

    _.each(this.methods, function(method) {
      if(typeof service[method] === 'function') {
        mixin[method] = wrapper;
      }
    });

    service.mixin(mixin);
  }
};
