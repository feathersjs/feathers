var _ = require('lodash');
var getArguments = require('feathers-commons').getArguments;

module.exports = function (service) {
  if (typeof service.mixin === 'function') {
    var mixin = {};

    _.each(this.methods, function(method) {
      if(typeof service[method] === 'function') {
        mixin[method] = function() {
          var args = getArguments(method, arguments);
          return this._super.apply(this, args);
        };
      }
    });

    service.mixin(mixin);
  }
};
