const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const { NotAuthenticated } = require('@feathersjs/errors');

const authentication = require('../../lib');
const { authenticate } = authentication;

class ApiKeyStrategy {
  authenticate (params) {
    if (params.strategy === 'api-key' && params.apiKey === '12345') {
      return Promise.resolve({
        user: {
          id: 33,
          name: 'David'
        }
      });
    }

    throw new NotAuthenticated('Invalid API key');
  }

  parse (req) {
    const apiKey = req.headers && req.headers['x-api-key'];

    if (apiKey) {
      return Promise.resolve({
        strategy: 'api-key',
        apiKey
      });
    }

    return Promise.resolve(null);
  }
}

const app = express(feathers());

app.use(express.json());
app.use((req, res, next) => {
  // Parse the HTTP request and response for strategy auth information
  app.service('authentication')
    .parse(req, res, 'api-key')
    .then(result => {
      if (result !== null) {
        req.feathers.authentication = result;
      }

      next();
    })
    .catch(error => next(error));
});
app.configure(express.rest());
app.configure(socketio());
app.use('/authentication', authentication(app, {
  secret: 'supersecret'
}));
app.use('/protected', {
  get (id, params) {
    return Promise.resolve({
      id,
      params
    });
  }
});

app.service('protected').hooks({
  before: {
    get: [ authenticate('api-key') ]
  }
});

app.service('authentication').hooks({
  before: {
    create: [ authenticate('api-key') ]
  }
});

app.service('authentication').register('api-key', new ApiKeyStrategy());

module.exports = app;
