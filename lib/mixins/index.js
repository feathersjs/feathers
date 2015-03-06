'use strict';

module.exports = function() {
  return [
    require('./promise'),
    require('./event'),
    require('./normalizer')
  ];
};
