var utils = require('../utils');
var Base = require('./base');
var normalizer = require('../normalizer');
var Service = Base.extend({
  request: function (options, callback) {
    this.connection(utils.extend({
      json: true
    }, options), function(error, res, data) {
      if(!error && res.statusCode >= 400) {
        return callback(new Error(data));
      }

      callback(error, data);
    });
  }
}).mixin(normalizer);

module.exports = function(request) {
  if(!request) {
    throw new Error('request instance needs to be provided');
  }

  return function() {
    this.Service = Service;
    this.connection = request;
  };
};

module.exports.Service = Service;