const AuthenticationCore = require('./core');
const AuthenticationService = require('./service');
const BaseStrategy = require('./strategy');
const JWTStrategy = require('./jwt');
const hooks = require('./hooks');

exports.BaseStrategy = BaseStrategy;
exports.JWTStrategy = JWTStrategy;
exports.AuthenticationCore = AuthenticationCore;
exports.AuthenticationService = AuthenticationService;
exports.authenticate = hooks.authenticate;
exports.hooks = hooks;
