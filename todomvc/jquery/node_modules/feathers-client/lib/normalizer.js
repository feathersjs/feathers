var utils = require('./utils');
var getArguments = require('./arguments');
var result = {};

utils.methods.forEach(function(method) {
  result[method] = function() {
    var args = getArguments(method, arguments);
    this._super.apply(this, args);
  };
});

module.exports = result;
