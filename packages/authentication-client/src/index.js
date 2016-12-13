import hooks from './hooks/index';
import Passport from './passport';

const defaults = {
  header: 'authorization',
  cookie: 'feathers-jwt',
  storageKey: 'feathers-jwt',
  jwtStrategy: 'jwt',
  path: '/authentication',
  entity: 'user',
  service: 'users'
};

export default function init (config = {}) {
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
      if (typeof service.before !== 'function' || typeof service.after !== 'function') {
        throw new Error(`It looks like feathers-hooks isn't configured. It is required before running feathers-authentication.`);
      }

      service.before(hooks.populateAccessToken(options));
    });

    // Set up hook that adds authorization header for REST provider
    if (app.rest) {
      app.mixins.push(function (service) {
        service.before(hooks.populateHeader(options));
      });
    }
  };
}

init.defaults = defaults;
