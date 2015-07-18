var Base = require('./base');
var normalizer = require('../normalizer');
var Service = Base.extend({
  request: function (options, callback) {
    var superagent = this.connection(options.method, options.url)
      .type(options.type || 'json');

    if(options.body) {
      superagent.send(options.body);
    }

    superagent.end(function(error, res) {
      callback(error, res && res.body);
    });
  }
}).mixin(normalizer);

module.exports = function(superagent) {
  if(!superagent) {
    throw new Error('Superagent needs to be provided');
  }

  return function() {
    this.Service = Service;
    this.connection = superagent;
  };
};

module.exports.Service = Service;
