const AuthenticationBase = require('./base');
const AuthenticationService = require('./service');
const BaseStrategy = require('./base');
const JWTStrategy = require('./jwt');
const hooks = require('./hooks');

exports.BaseStrategy = BaseStrategy;
exports.JWTStrategy = JWTStrategy;
exports.AuthenticationBase = AuthenticationBase;
exports.AuthenticationService = AuthenticationService;
exports.authenticate = hooks.authenticate;
exports.hooks = hooks;
