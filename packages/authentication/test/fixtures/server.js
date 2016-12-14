import path from 'path';
import feathers from 'feathers';
import rest from 'feathers-rest';
import socketio from 'feathers-socketio';
import primus from 'feathers-primus';
import hooks from 'feathers-hooks';
import memory from 'feathers-memory';
import bodyParser from 'body-parser';
import errorHandler from 'feathers-errors/handler';
import local from 'feathers-authentication-local';
import jwt from 'feathers-authentication-jwt';
import auth from '../../lib/index';

const User = {
  email: 'admin@feathersjs.com',
  password: 'admin',
  permissions: ['*']
};

// function customizeJWTPayload() {
//   return function(hook) {
//     hook.data.payload = {
//       id: hook.params.user.id
//     };

//     return Promise.resolve(hook);
//   };
// }

export default function (settings, socketProvider) {
  const app = feathers();

  app.configure(rest())
    .configure(socketProvider === 'socketio' ? socketio() : primus({
      transformer: 'websockets'
    }))
    .configure(hooks())
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
    .use('/', feathers.static(path.resolve(__dirname, '/public')));

  app.service('authentication').hooks({
    before: {
      create: [
        auth.hooks.authenticate(['jwt', 'local', 'org-local'])
        // customizeJWTPayload()
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
}
