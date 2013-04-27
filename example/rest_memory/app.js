var feathry = require('../../lib/feathry');
var Proto = require('uberproto');
var memoryService = feathry.memory();
var users = [
  {
    id: '1',
    name : 'Wayne Campbell',
    slogan: 'Party on Garth'
  },
  {
    id: '2',
    name : 'Garth Algar',
    slogan: 'Party on Wayne'
  }
];

Proto.mixin(require('../../lib/mixin/event'), memoryService);

feathry.createServer({ port: 8000 })
  .service('users', memoryService)
  .provide(feathry.rest())
  .start();