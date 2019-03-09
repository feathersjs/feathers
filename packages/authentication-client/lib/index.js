const { AuthenticationClient, Storage } = require('./core');
const hooks = require('./hooks');
const defaults = {
  header: 'Authorization',
  scheme: 'Bearer',
  storageKey: 'feathers-jwt',
  jwtStrategy: 'jwt',
  path: '/authentication',
  Authentication: AuthenticationClient
};

module.exports = _options => {
  const options = Object.assign({}, {
    storage: new Storage()
  }, defaults, _options);
  const { Authentication } = options;

  return app => {
    const authentication = new Authentication(app, options);

    app.authentication = authentication;
    app.authenticate = authentication.authenticate.bind(authentication);
    app.reauthenticate = authentication.reauthenticate.bind(authentication);
    app.logout = authentication.logout.bind(authentication);

    app.hooks({
      before: [
        hooks.authentication(),
        hooks.populateHeader()
      ]
    });
  };
};

Object.assign(module.exports, {
  AuthenticationClient, Storage, hooks, defaults
});
