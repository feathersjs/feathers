'use strict';

var _ = require('lodash');

module.exports = function() {
  var mixins = [
    require('./promise'),
    require('./event'),
    require('./normalizer')
  ];

  // Override push to make sure that normalize is always the last
  mixins.push = function() {
    var args = [ this.length - 1, 0].concat(_.toArray(arguments));
    this.splice.apply(this, args);
    return this.length;
  };

  return mixins;
};
