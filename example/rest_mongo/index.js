var feathers = require('../../lib/feathers');
var Proto = require('uberproto');
var mongoService = feathers.mongo();
var express = require('express');

Proto.mixin(require('../../lib/mixins/event'), mongoService);

feathers.createServer()
  .use(express.static(__dirname))
  .service('users', mongoService)
  .provide(feathers.rest())
  .start();