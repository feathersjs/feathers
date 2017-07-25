const feathers = require('feathers');
const socketio = require('../lib');
const memory = require('feathers-memory');

function todoService () {
  return memory().extend({
    get: function (id, params, callback) {
      if (params.query.error) {
        return callback(new Error('Something went wrong'));
      }

      return this._super(id, params).then(
        data => Object.assign({ query: params.query }, data)
      );
    }
  });
}

module.exports = function () {
  const app = feathers().configure(socketio());
  const v1 = feathers().configure(socketio()).use('/todos', todoService());
  const v2 = feathers().configure(socketio()).use('/todos', todoService());

  app.use('/api/v1', v1);
  app.use('/api/v2', v2);

  v1.service('todos').create({ text: 'some todo', complete: false }, {}, function () {});
  v2.service('todos').create({ text: 'some todo', complete: false }, {}, function () {});

  return app;
};
