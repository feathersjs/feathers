const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
const { AuthenticationService } = require('@feathersjs/authentication');

const { LocalStrategy, hashPassword, protect } = require('../lib');

module.exports = () => {
  const app = feathers();
  const authentication = new AuthenticationService(app);

  app.set('authentication', {
    secret: 'supersecret',
    strategies: [ 'local' ],
    local: {
      usernameField: 'email',
      passwordField: 'password'
    }
  });

  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  app.use('/users', memory());

  app.service('users').hooks({
    before: {
      create: hashPassword('password')
    },
    after: protect('password')
  });

  return app;
};
