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
    .use('/', new TodoService())
    .use('/todos', new TodoService());
  const service = app.service('todos');
  const rootService = app.service('/');
  const publisher = () => app.channel('general');
  const data = {
    text: 'some todo',
    complete: false
  };

  app.on('connection', connection =>
    app.channel('general').join(connection)
  );

  rootService.create(data);
  rootService.publish(publisher);

  service.create(data);
  service.publish(publisher);

  return app;
};
