const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const GithubStrategy = require('passport-github').Strategy;
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const oauth2 = require('../lib/index');

// Initialize the application
const app = feathers();
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
    scope: ['user:email']
  }))
  .use('/users', memory())
  .use(errorHandler());

function customizeGithubProfile() {
  return function(hook) {
    console.log('Customizing Github Profile');
    // If there is a github field they signed up or
    // signed in with github so let's pull the email
    if (hook.data.github) {
      hook.data.email = hook.data.github.profile.emails.find(email => email.primary).value;
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
