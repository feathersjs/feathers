const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');
const { Service } = require('feathers-memory');

// eslint-disable-next-line no-extend-native
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

// Create an in-memory CRUD service for our Todos
class TodoService extends Service {
  get (id, params) {
    if (params.query.error) {
      return Promise.reject(new Error('Something went wrong'));
    }

    return super.get(id, params).then(data =>
      Object.assign({ query: params.query }, data)
    );
  }
}

module.exports = function () {
  const app = feathers()
    .configure(socketio())
    .use('/todos', new TodoService());
  const service = app.service('todos');

  app.on('connection', connection =>
    app.channel('general').join(connection)
  );

  service.create({
    text: 'some todo',
    complete: false
  });

  service.publish(() => app.channel('general'));

  return app;
};
