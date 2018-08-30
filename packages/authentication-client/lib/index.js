const hooks = require('./hooks/index');
const Passport = require('./passport');

const defaults = {
  header: 'Authorization',
  cookie: 'feathers-jwt',
  storageKey: 'feathers-jwt',
  jwtStrategy: 'jwt',
  path: '/authentication',
  entity: 'user',
  service: 'users',
  timeout: 5000
};

function init (config = {}) {
  const options = Object.assign({}, defaults, config);

  return function () {
    const app = this;

    app.passport = new Passport(app, options);
    app.authenticate = app.passport.authenticate.bind(app.passport);
    app.logout = app.passport.logout.bind(app.passport);

    // Set up hook that adds token and user to params so that
    // it they can be accessed by client side hooks and services
    app.mixins.push(function (service) {
      // if (typeof service.hooks !== 'function') {
      if (app.version < '3.0.0') {
        throw new Error(`This version of @feathersjs/authentication-client only works with @feathersjs/feathers v3.0.0 or later.`);
      }

      service.hooks({
        before: hooks.populateAccessToken(options)
      });
    });

    // Set up hook that adds authorization header for REST provider
    if (app.rest) {
      app.mixins.push(function (service) {
        service.hooks({
          before: hooks.populateHeader(options)
        });
      });
    }
  };
}

module.exports = init;

module.exports.default = init;
module.exports.defaults = defaults;
