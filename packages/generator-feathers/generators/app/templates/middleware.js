'use strict';

const errors = require('feathers-errors');
const notFound = require('./not-found-handler');
const logger = require('./logger');

module.exports = function() {
  const app = this;

  // Add your custom middleware here. Remember, that
  // just like Express the order matters, so error
  // handling middleware should go last.
  app.use(notFound())
    .use(logger(app))
    .use(errors.handler());
};
