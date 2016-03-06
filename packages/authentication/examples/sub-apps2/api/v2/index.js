var feathers = require('feathers');
var service = require('./services/message');

// Initialize the application
var app = feathers()
  // Initialize our Message service sub app
  .use('/v2', service)

module.exports = app;
