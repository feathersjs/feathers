var feathers = require('feathers');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var feathersPassportJwt = require('../lib/passport');
var hashPassword = feathersPassportJwt.hashPassword;

// Initialize the application
var app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-passport-jwt
  .configure(feathersPassportJwt({
    secret: 'feathers-rocks'
  }))
  // Initialize a user service
  .use('/api/users', memory())
  // A simple Todos service that we can used for testing
  .use('/todos', {
    get: function(id, params, callback) {
      callback(null, {
        id: id,
        text: 'You have to do ' + id + '!',
        user: params.user
      });
    }
  })
  .use('/', feathers.static(__dirname));

var userService = app.service('/api/users');

// Add a hook to the user service that automatically replaces 
// the password with a hash of the password before saving it.
userService.before({
  create: hashPassword()
});

// Create a user that we can use to log in
userService.create({
  username: 'feathers',
  password: 'secret'
}, {}, function(error, user) {
  console.log('Created default user', user);
});

app.listen(4000);