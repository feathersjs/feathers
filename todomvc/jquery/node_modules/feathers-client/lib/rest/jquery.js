var utils = require('../utils');
var Base = require('./base');
var normalizer = require('../normalizer');
var Service = Base.extend({
  request: function (options, callback) {
    var opts = utils.extend({
      dataType: options.type || 'json'
    }, options);

    if(options.body) {
      opts.data = JSON.stringify(options.body);
      opts.contentType = 'application/json';
    }

    delete opts.type;
    delete opts.body;

    this.connection.ajax(opts).then(function (data) {
      callback(null, data);
    }, function (xhr) {
      callback(new Error(xhr.responseText));
    });
  }
}).mixin(normalizer);

module.exports = function(jQuery) {
  if(!jQuery && typeof window !== 'undefined') {
    jQuery = window.jQuery;
  }

  if(typeof jQuery !== 'function') {
    throw new Error('jQuery instance needs to be provided');
  }

  return function() {
    this.Service = Service;
    this.connection = jQuery;
  };
};

module.exports.Service = Service;
