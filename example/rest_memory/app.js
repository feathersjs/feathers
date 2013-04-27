var feathry = require('../../lib/feathry');
var Proto = require('uberproto');
var memoryService = feathry.memory();

Proto.mixin(require('../../lib/mixin/event'), memoryService);

feathry.createServer({ port: 8000 })
  .service('users', memoryService)
  .provide(feathry.rest())
  .start();