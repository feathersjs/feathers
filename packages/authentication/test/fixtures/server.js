const path = require('path');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const rest = require('@feathersjs/express/rest');
const socketio = require('@feathersjs/socketio');
const primus = require('@feathersjs/primus');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('@feathersjs/errors/handler');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const auth = require('../../lib/index');

const User = {
  email: 'admin@feathersjs.com',
  password: 'admin',
  permissions: ['*']
};

module.exports = function (settings, socketProvider) {
  const app = express(feathers());

  let _provider;
  if (socketProvider === 'socketio') {
    _provider = socketio((io) => {
      io.use((socket, next) => {
        socket.feathers.data = 'Hello world';
        next();
      });
    });
  } else {
    _provider = primus({
      transformer: 'websockets'
    }, function (primus) {
      // Set up Primus authorization here
      primus.authorize(function (req, done) {
        req.feathers.data = 'Hello world';

        done();
      });
    });
  }

  app.configure(rest())
    .configure(_provider)
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .configure(auth(settings))
    .configure(local())
    .configure(local({
      name: 'org-local',
      entity: 'org'
    }))
    .configure(jwt())
    .use('/users', memory())
    .use('/', express.static(path.resolve(__dirname, '/public')));

  app.service('authentication').hooks({
    before: {
      create: [
        auth.hooks.authenticate(['jwt', 'local', 'org-local'])
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

  // Custom Express routes
  app.get('/protected', auth.express.authenticate('jwt'), (req, res, next) => {
    res.json({ success: true });
  });

  app.get('/unprotected', (req, res, next) => {
    res.json({ success: true });
  });

  // Custom route with custom redirects
  app.post('/login', auth.express.authenticate('local', { successRedirect: '/app', failureRedirect: '/login' }));

  app.get('/app', (req, res, next) => {
    res.json({ success: true });
  });

  app.get('/login', (req, res, next) => {
    res.json({ success: false });
  });

  app.use(errorHandler());

  return app;
};
