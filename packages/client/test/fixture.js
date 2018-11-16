const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const rest = require('@feathersjs/express/rest');
const memory = require('feathers-memory');

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

module.exports = function (configurer) {
  // Create an in-memory CRUD service for our Todos
  var todoService = memory().extend({
    get: function (id, params) {
      if (params.query.error) {
        return Promise.reject(new Error('Something went wrong'));
      }

      return this._super(id, params).then(data =>
        Object.assign({ query: params.query }, data)
      );
    }
  });

  var app = express(feathers())
    .configure(rest());

  if (typeof configurer === 'function') {
    configurer.call(app);
  }

  // Parse HTTP bodies
  app.use(express.json())
    .use(express.urlencoded({ extended: true }))
    // Host the current directory (for index.html)
    .use(express.static(process.cwd()))
    // Host our Todos service on the /todos path
    .use('/todos', todoService);

  const testTodo = {
    text: 'some todo',
    complete: false
  };
  const service = app.service('todos');

  service.create(testTodo);
  service.hooks({
    after: {
      remove (hook) {
        if (hook.id === null) {
          service._uId = 0;
          return service.create(testTodo)
            .then(() => hook);
        }
      }
    }
  });

  app.on('connection', connection =>
    app.channel('general').join(connection)
  );

  if (service.publish) {
    service.publish(() => app.channel('general'));
  }

  return app;
};
