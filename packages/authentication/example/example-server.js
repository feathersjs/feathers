var feathers = require('feathers');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var feathersAuth = require('../lib/index');
var hashPassword = feathersAuth.hooks.hashPassword;

// Initialize the application
var app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(feathersAuth({
    secret: 'feathers-rocks'
  }))
  // Initialize a user service
  .use('/api/users', memory())
  // A simple Todos service that we can used for testing
  .use('/api/todos', memory())
  .use('/', feathers.static(__dirname + '/public'));

var todoService = app.service('/api/todos');
todoService.create({name: 'Do the dishes'}, {}, function(){});
todoService.create({name: 'Buy a guitar'}, {}, function(){});
todoService.create({name: 'Exercise for 30 minutes.'}, {}, function(){});

var userService = app.service('/api/users');

// Add a hook to the user service that automatically replaces 
// the password with a hash of the password before saving it.
userService.before({
  create: hashPassword()
});

// Create a user that we can use to log in
userService.create({
  username: 'feathers',
  password: 'test'
}, {}, function(error, user) {
  console.log('Created default user', user);
  console.log('Open http://localhost:4000');
});

app.listen(4000);
