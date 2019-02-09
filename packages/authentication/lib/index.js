const AuthenticationBase = require('./base');
const AuthenticationService = require('./service');
const JwtStrategy = require('./jwt');
const hooks = require('./hooks');
const jwt = (...args) => {
  return new JwtStrategy(...args);
};

module.exports = (...args) => {
  return new AuthenticationService(...args);
};

Object.assign(module.exports, {
  JwtStrategy,
  AuthenticationBase,
  AuthenticationService,
  authenticate: hooks.authenticate,
  hooks,
  jwt
});
