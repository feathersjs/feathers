var feathers = require('../../lib/feathers');
var Proto = require('uberproto');

var options = {
  // username: 'hulk',
  // password: 'greenman',
  // host: 'localhost',
  // port: '27017',
  // reconnect: true,
  db: 'feathers'
};

var mongoService = feathers.mongo(options);
var express = require('express');

Proto.mixin(require('../../lib/mixins/event'), mongoService);

feathers.createServer()
  .use(express.static(__dirname))
  .service('users', mongoService)
  .provide(feathers.rest())
  .start();