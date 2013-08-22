var feathers = require('../../lib/feathers');
var memoryService = feathers.service.memory();
var express = require('express');

feathers()
  .use(express.static(__dirname))
  .service('users', memoryService)
  .provide(feathers.rest())
  .listen(3000);
