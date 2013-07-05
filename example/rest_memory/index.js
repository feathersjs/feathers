var feathers = require('../../lib/feathers');
var Proto = require('uberproto');
var memoryService = feathers.memory();
var express = require('express');

feathers.createServer({ port: 3000 })
  .use(express.static(__dirname))
  .service('users', memoryService)
  .provide(feathers.rest())
  .start();
