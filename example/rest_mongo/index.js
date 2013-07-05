var feathers = require('../../lib/feathers');
var Proto = require('uberproto');

var userOptions = {
  collection: 'users'
};

var postOptions = {
  collection: 'posts'
};

var userService = feathers.service.mongodb(userOptions);
var postService = feathers.service.mongodb(postOptions);
var express = require('express');

Proto.mixin(require('../../lib/mixins/event'), userService);
Proto.mixin(require('../../lib/mixins/event'), postService);

feathers.createServer()
  .use(express.static(__dirname))
  .service('users', userService)
  .service('posts', postService)
  .provide(feathers.rest())
  .provide(feathers.socketio())
  .start();