var bcrypt = require('bcrypt');

/**
 * A function that generates a feathers hook that replaces a password located
 * at the provided passwordField with a hash of the password.
 * @param  {String} passwordField  The field containing the password.
 * @return {function}   The hashPassword feathers hook.
 */
exports.hashPassword = function(passwordField){
  passwordField = passwordField || 'password';
  return function(hook, next) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(hook.data[passwordField], salt, function(err, hash) {
        hook.data[passwordField] = hash;
        return next();
      });
    });
  };
};