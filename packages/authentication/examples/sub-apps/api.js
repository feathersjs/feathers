var feathers = require('feathers');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var authentication = require('../../lib/index').default;
var authHooks = require('../../lib/index').hooks;

var app = feathers()
  .configure(rest())
  .configure(socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(authentication({
    token: {
      secret: 'feathers-rocks'
    },
    local: {
      userEndpoint: '/users'
    }
  }))
  // Initialize a user service
  .use('/users', memory())
  // A simple Message service that we can used for testing
  .use('/messages', memory())
  .use(function(error, req, res, next){
    res.status(error.code);
    res.json(error);
  });


var messageService = app.service('/messages');
messageService.create({text: 'A million people walk into a Silicon Valley bar'}, {}, function(){});
messageService.create({text: 'Nobody buys anything'}, {}, function(){});
messageService.create({text: 'Bar declared massive success'}, {}, function(){});

messageService.before({
  all: [
    authHooks.verifyToken({secret: 'feathers-rocks'}),
    authHooks.populateUser(),
    authHooks.requireAuth()
  ]
})

var userService = app.service('users');

// Add a hook to the user service that automatically replaces 
// the password with a hash of the password before saving it.
userService.before({
  create: authHooks.hashPassword()
});

// Create a user that we can use to log in
var User = {
  email: 'admin@feathersjs.com',
  password: 'admin'
};

userService.create(User, {}).then(function(user) {
  console.log('Created default user', user);
});

module.exports = app;
