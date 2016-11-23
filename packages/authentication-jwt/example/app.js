var feathers = require('feathers');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var errorHandler = require('feathers-errors/handler');
var auth = require('feathers-authentication');
var jwt = require('../lib/index');

// Initialize the application
var app = feathers();

app.configure(rest())
  .configure(socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(jwt())
  .use('/users', memory())
  .use(errorHandler());

const issueJWT = () => {
  return hook => {
    const app = hook.app;
    const id = hook.result.id;
    return app.passport.createJWT({ userId: id }, app.get('auth')).then(accessToken => {
      hook.result.accessToken = accessToken;
      return Promise.resolve(hook);
    });
  };
};

// Authenticate the user using the default
// email/password strategy and if successful
// return a JWT.
app.service('authentication').hooks({
  before: {
    create: [auth.hooks.authenticate('jwt')]
  }
});

// Add a hook to the user service that automatically replaces
// the password with a hash of the password before saving it.
app.service('users').hooks({
  before: {
    find: [auth.hooks.authenticate('jwt')]
  },
  after: {
    create: [issueJWT()]
  }
});

// Create a user that we can use to log in
var User = {
  email: 'admin@feathersjs.com',
  permissions: ['*']
};

app.service('users').create(User).then(user => {
  console.log('Created default user', user);
}).catch(console.error);

app.listen(3030);

console.log('Feathers authentication with local auth started on 127.0.0.1:3030');
