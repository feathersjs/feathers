var feathers = require('feathers');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var primus = require('feathers-primus');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var authentication = require('../../lib/index');
var authHooks = require('../../lib/index').hooks;

// Passport Auth Strategies
var FacebookStrategy = require('passport-facebook').Strategy;
var GithubStrategy = require('passport-github').Strategy;

// Initialize the application
var app = feathers()
  .configure(rest())
  // .configure(primus({
  //   transformer: 'websockets'
  // }))
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
      userEndpoint: '/api/users'
    },
    facebook: {
      strategy: FacebookStrategy,
      "clientID": "your-facebook-client-id",
      "clientSecret": "your-facebook-client-secret",
      "permissions": {
        authType: 'rerequest',
        "scope": ["public_profile", "email"]
      }
    },
    github: {
      strategy: GithubStrategy,
      "clientID": "your-github-client-id",
      "clientSecret": "your-github-client-secret"
    }
  }))
  // Initialize a user service
  .use('/api/users', memory())
  // A simple Message service that we can used for testing
  .use('/messages', memory())
  .use('/', feathers.static(__dirname + '/public'))
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

var userService = app.service('api/users');

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

app.listen(3030);

console.log('Feathers authentication app started on 127.0.0.1:3030');
