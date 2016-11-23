var feathers = require('feathers');
var rest = require('feathers-rest');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var GithubStrategy = require('passport-github').Strategy;
var errorHandler = require('feathers-errors/handler');
var auth = require('feathers-authentication');
var oauth2 = require('../lib/index');

// Initialize the application
var app = feathers();
app.set('port', 3030);

app.configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(oauth2({
    name: 'github',
    Strategy: GithubStrategy,
    clientID: 'your client id',
    clientSecret: 'your client secret',
    scope: ['user']
  }))
  .use('/users', memory())
  .use(errorHandler());

function customizeGithubProfile() {
  return function(hook) {
    console.log('Customizing Github Profile');
    // If there is a github field they signed up or
    // signed in with github so let's pull the email
    if (hook.data.github) {
      hook.data.email = hook.data.github.email; 
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
    create: [customizeGithubProfile()],
    update: [customizeGithubProfile()]
  }
});

app.listen(app.get('port'));

console.log('Feathers authentication with oauth2 auth started on 127.0.0.1:3030');
