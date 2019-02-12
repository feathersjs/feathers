const LocalStrategy = require('./strategy');
const hashPassword = require('./hooks/hash-password');
const protect = require('./hooks/protect');

exports.LocalStrategy = LocalStrategy;
exports.protect = protect;
exports.hashPassword = hashPassword;
