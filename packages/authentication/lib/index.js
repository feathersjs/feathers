const AuthenticationBase = require('./base');
const AuthenticationService = require('./service');
const hooks = require('./hooks');

module.exports = (...args) => {
  return new AuthenticationService(...args);
};

Object.assign(module.exports, {
  AuthenticationBase,
  AuthenticationService,
  authenticate: hooks.authenticate,
  hooks
});
