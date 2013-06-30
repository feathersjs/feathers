var feathers = require('../../lib/feathers');
var Proto = require('uberproto');
var memoryService = feathers.memory();
var express = require('express');

Proto.mixin(require('../../lib/mixins/event'), memoryService);

feathers.createServer()
  .use(express.static(__dirname))
  .service('users', memoryService)
  .provide(feathers.rest())
  .start();