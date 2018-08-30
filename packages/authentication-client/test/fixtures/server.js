const path = require('path');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const rest = require('@feathersjs/express/rest');
const socketio = require('@feathersjs/socketio');
const primus = require('@feathersjs/primus');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('@feathersjs/errors/handler');
const local = require('@feathersjs/authentication-local');
const jwt = require('@feathersjs/authentication-jwt');
const auth = require('@feathersjs/authentication');

const User = {
  email: 'admin@feathersjs.com',
  password: 'admin',
  permissions: ['*']
};

module.exports = function (settings, socketProvider) {
  const app = express(feathers());

  app.configure(rest())
    .configure(socketProvider === 'socketio' ? socketio() : primus({
      transformer: 'websockets'
    }))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .configure(auth(settings))
    .configure(local())
    .configure(jwt())
    .use('/users', memory())
    .use('/', express.static(path.resolve(__dirname, '/public')))
    .use(errorHandler());

  app.service('authentication').hooks({
    before: {
      create: [
        auth.hooks.authenticate(['jwt', 'local'])
      ],
      remove: [
        auth.hooks.authenticate('jwt')
      ]
    }
  });

  // Add a hook to the user service that automatically replaces
  // the password with a hash of the password before saving it.
  app.service('users').hooks({
    before: {
      find: [
        auth.hooks.authenticate('jwt')
      ],
      create: [
        local.hooks.hashPassword({ passwordField: 'password' })
      ]
    }
  });

  // Create a user that we can use to log in
  app.service('users').create(User).catch(console.error);

  return app;
};
