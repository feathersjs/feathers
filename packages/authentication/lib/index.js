"use strict";
const AuthenticationCore = require('./core');
const AuthenticationService = require('./service');
const JWTStrategy = require('./jwt');
const hooks = require('./hooks');
exports.JWTStrategy = JWTStrategy;
exports.AuthenticationCore = AuthenticationCore;
exports.AuthenticationService = AuthenticationService;
exports.authenticate = hooks.authenticate;
exports.hooks = hooks;
//# sourceMappingURL=index.js.map