var feathers = require('feathers');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var errorHandler = require('feathers-errors/handler');
var authentication = require('../lib/index');

// Initialize the application
var app = feathers()
  .configure(rest())
  .configure(socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(authentication({
    idField: 'id'
  }))
  // Initialize a user service
  .use('/users', memory())
  // A simple Message service that we can used for testing
  .use('/messages', memory({
    paginate: {
      default: 5,
      max: 25
    }
  }))
  .use('/approved-messages', memory())
  .use('/', feathers.static(__dirname + '/public'))
  .use(errorHandler());

var messageService = app.service('/messages');
messageService.create({text: 'A million people walk into a Silicon Valley bar'}, {}, function(){});
messageService.create({text: 'Nobody buys anything'}, {}, function(){});
messageService.create({text: 'Bar declared massive success'}, {}, function(){});

messageService.before({
  all: [
    authentication.hooks.verifyToken(),
    authentication.hooks.populateUser(),
    authentication.hooks.restrictToAuthenticated()
  ]
})

var approvedMessageService = app.service('/approved-messages');
approvedMessageService.create({text: 'A million people walk into a Silicon Valley bar', approved: false, author: 'James'}, {}, function(){});
approvedMessageService.create({text: 'Nobody buys anything', approved: true, author: 'Todd'}, {}, function(){});
approvedMessageService.create({text: 'Bar declared massive success', approved: true, author: 'James'}, {}, function(){});


// Will merge this restriction with the query params
var restriction = { restrict: {approved: true} };

approvedMessageService.before({
  all: [
    // Necessary since restrict must always use find and hook id is a string when the memory service expects it as a number
    function(hook) {
      if(hook.id) {
        hook.id = parseInt(hook.id, 10);
      }
    }
  ],
  find: [
    authentication.hooks.verifyOrRestrict(restriction),
    authentication.hooks.populateOrRestrict(restriction),
    authentication.hooks.hasRoleOrRestrict(Object.assign({roles: ['admin']}, restriction))
  ],
  get: [
    authentication.hooks.verifyOrRestrict(restriction),
    authentication.hooks.populateOrRestrict(restriction),
    authentication.hooks.hasRoleOrRestrict(Object.assign({roles: ['admin']}, restriction))
  ]
})


var userService = app.service('users');

// Add a hook to the user service that automatically replaces
// the password with a hash of the password before saving it.
userService.before({
  create: authentication.hooks.hashPassword()
});

// Create a user that we can use to log in
var User = {
  email: 'admin@feathersjs.com',
  password: 'admin',
  roles: ['admin']
};

userService.create(User, {}).then(function(user) {
  console.log('Created default user', user);
});

app.listen(3030);

console.log('Feathers authentication app started on 127.0.0.1:3030');
