'use strict';

const rethinkdbdash = require('rethinkdbdash');

module.exports = function() {
  const app = this;
  const config = app.get('rethinkdb');
  const r = rethinkdbdash(config);

  app.set('rethinkdbClient', r);
};
