const feathers = require('@feathersjs/feathers');
const expressify = require('@feathersjs/express');
const bodyParser = require('body-parser');
const { Service } = require('feathers-memory');
const errors = require('@feathersjs/errors');
const rest = require('@feathersjs/express/rest');

// eslint-disable-next-line no-extend-native
Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    var alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true,
  writable: true
});

let errorHandler = function (error, req, res, next) {
  const code = !isNaN(parseInt(error.code, 10)) ? parseInt(error.code, 10) : 500;
  res.status(code);

  res.format({
    'application/json': function () {
      let output = Object.assign({}, error.toJSON());
      res.json(output);
    }
  });
};

// Create an in-memory CRUD service for our Todos
class TodoService extends Service {
  get (id, params) {
    if (params.query.error) {
      throw new Error('Something went wrong');
    }

    if (params.query.feathersError) {
      throw new errors.NotAcceptable('This is a Feathers error', { data: true });
    }

    return super.get(id)
      .then(data => {
        const result = Object.assign({ query: params.query }, data);

        if (params.authorization) {
          result.authorization = params.authorization;
        }

        return result;
      });
  }

  remove (id, params) {
    if (id === null) {
      return Promise.resolve({
        id, text: 'deleted many'
      });
    }

    if (params.query.noContent) {
      return Promise.resolve();
    }

    return super.remove(id, params);
  }
}

module.exports = function (configurer) {
  const app = expressify(feathers())
    .configure(rest(function formatter (req, res, next) {
      if (!res.data) {
        next();
      }

      res.format({
        html () {
          res.end('<h1>This is HTML content. You should not see it.</h1>');
        },

        json () {
          res.json(res.data);
        }
      });
    }))
    .use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Authorization');
      req.feathers.authorization = req.headers.authorization;
      next();
    })
    // Parse HTTP bodies
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    // Host our Todos service on the /todos path
    .use('/todos', new TodoService())
    .use(errorHandler);

  if (typeof configurer === 'function') {
    configurer.call(app);
  }

  app.service('todos').create({
    text: 'some todo',
    complete: false
  });

  return app;
};
