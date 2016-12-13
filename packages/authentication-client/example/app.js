const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const path = require('path');

function customizeJWTPayload () {
  return function (hook) {
    hook.data.payload = {
      id: hook.params.user.id
    };

    return Promise.resolve(hook);
  };
}

const app = feathers();
app.configure(rest())
  .configure(socketio())
  // .configure(primus({ transformer: 'websockets' }))
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(auth({ secret: 'supersecret' }))
  .configure(local())
  .configure(jwt())
  .use('/users', memory())
  .use('/', feathers.static(path.join(__dirname, '/public')))
  .use(errorHandler());

app.service('authentication').hooks({
  before: {
    create: [
      // You can chain multiple strategies
      auth.hooks.authenticate(['jwt', 'local']),
      customizeJWTPayload()
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
    find: auth.hooks.authenticate('jwt'),
    get: auth.hooks.authenticate('jwt'),
    create: local.hooks.hashPassword({ passwordField: 'password' })
  }
});

var User = {
  email: 'admin@feathersjs.com',
  password: 'admin',
  permissions: ['*']
};

app.service('users').create(User).then(user => {
  console.log('Created default user', user);
}).catch(console.error);

app.listen(3030);

console.log('Feathers authentication with local auth started on 127.0.0.1:3030');
