import feathers from 'feathers';
import socketio from '../../src';
import memory from 'feathers-memory';

Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    var alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true
});

export default function() {
  // Create an in-memory CRUD service for our Todos
  var todoService = memory().extend({
    get: function(id, params, callback) {
      if(params.query.error) {
        return callback(new Error('Something went wrong'));
      }

      return this._super(id, params).then(data => Object.assign({ query: params.query }, data));
    }
  });

  var app = feathers()
    .configure(socketio())
    .use('/todos', todoService);

  app.service('todos').create({ text: 'some todo', complete: false }, {}, function() {});

  return app;
}
