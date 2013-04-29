var feathry = require('../../lib/feathry');
var Proto = require('uberproto');
var memoryService = feathry.memory();
var express = require('express');

Proto.mixin(require('../../lib/mixin/event'), memoryService);

feathry.createServer()
  .use(express.static(__dirname))
  .service('users', memoryService)
  .provide(feathry.rest())
  .start();