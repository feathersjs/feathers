import * as hooks from './hooks';
import Authentication from './authentication';

const defaults = {
  cookie: 'feathers-jwt',
  tokenKey: 'feathers-jwt',
  localEndpoint: '/auth/local',
  tokenEndpoint: '/auth/token'
};

export default function (opts = {}) {
  const options = Object.assign({}, defaults, opts);

  return function () {
    const app = this;

    app.authentication = new Authentication(app, options);
    app.authenticate = app.authentication.authenticate.bind(app.authentication);
    app.logout = app.authentication.logout.bind(app.authentication);

    // Set up hook that adds token and user to params so that
    // it they can be accessed by client side hooks and services
    app.mixins.push(function (service) {
      if (typeof service.before !== 'function' || typeof service.after !== 'function') {
        throw new Error(`It looks like feathers-hooks isn't configured. It is required before running feathers-authentication.`);
      }

      service.before(hooks.populateParams());
    });

    // Set up hook that adds authorization header for REST provider
    if (app.rest) {
      app.mixins.push(function (service) {
        service.before(hooks.populateHeader(options));
      });
    }
  };
}
