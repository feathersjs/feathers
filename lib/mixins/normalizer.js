var _ = require('lodash');
var commons = require('feathers-commons');

function makeNormalizer(method) {
  return function() {
    var args = commons.getArguments(method, arguments);
    return this._super.apply(this, args);
  };
}

module.exports = function (service) {
  if (typeof service.mixin === 'function') {
    var mixin = _.transform(_.pick(service, this.methods), function(result, value, key) {
      if(typeof value === 'function') {
        result[key] = makeNormalizer(key);
      }
    });

    service.mixin(mixin);
  }
};