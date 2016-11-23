var feathers = require('feathers');
var rest = require('feathers-rest');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var session = require('express-session');
var TwitterStrategy = require('passport-twitter').Strategy;
var errorHandler = require('feathers-errors/handler');
var auth = require('feathers-authentication');
var oauth1 = require('../lib/index');

// Initialize the application
var app = feathers();
app.set('port', 3030);

app.configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // set up session support. This is required for OAuth1 strategies
  .use(session({ secret: 'super secret', resave: true, saveUninitialized: true }))
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(oauth1({
    name: 'twitter',
    Strategy: TwitterStrategy,
    consumerKey: '<your consumer key>',
    consumerSecret: '<your consumer secret>'
  }))
  .use('/users', memory())
  .use(errorHandler());

function customizeTwitterProfile() {
  return function(hook) {
    console.log('Customizing Twitter Profile');
    // If there is a twitter field they signed up or
    // signed in with twitter so let's pull the email
    if (hook.data.twitter) {
      hook.data.email = hook.data.twitter.email;
    }

    return Promise.resolve(hook);
  };
}

// Authenticate the user using the default
// email/password strategy and if successful
// return a JWT.
app.service('authentication').hooks({
  before: {
    create: [
      auth.hooks.authenticate('jwt')
    ]
  }
});

// Add a hook to the user service that automatically replaces
// the password with a hash of the password before saving it.
app.service('users').hooks({
  before: {
    create: [customizeTwitterProfile()],
    update: [customizeTwitterProfile()]
  }
});

app.listen(app.get('port'));

console.log('Feathers authentication with oauth1 auth started on 127.0.0.1:3030');
