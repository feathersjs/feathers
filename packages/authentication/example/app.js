const path = require('path');
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const auth = require('../lib/index');

const app = feathers();
app.configure(rest())
  .configure(socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(auth({ secret: 'supersecret' }))
  .configure(local())
  .configure(jwt())
  .use('/users', memory())
  .use('/', feathers.static(path.resolve(__dirname, '/public')));

app.service('authentication').hooks({
  before: {
    create: [
      // You can chain multiple strategies
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

var User = {
  email: 'admin@feathersjs.com',
  password: 'admin',
  permissions: ['*']
};

app.service('users').create(User).then(user => {
  console.log('Created default user', user);
}).catch(console.error);

app.use(errorHandler());

app.listen(3030);

console.log('Feathers authentication with local auth started on 127.0.0.1:3030');
