var feathers = require('feathers');
var errors = require('./lib/errors');
var app = feathers().configure(associations())
  .use('/users', {
    find: function(params, callback) {
      callback(null, [{
        id: 0,
        name: 'testuser'
      }]);
    }
  })
  .use('/posts', {
    find: function(params, callback) {
      callback(null, [{
        id: 0,
        type: 'post',
        user: params.query.userId
      }, {
        id: 1,
        type: 'post',
        user: params.query.userId
      }]);
    }
  })
  .associate('/users/:userId/posts', ['posts']);

app.listen(8080);
