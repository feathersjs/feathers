import bcrypt from 'bcrypt';

/**
 * Replaces a password located at the provided `passwordField` with a hash
 * of the password.
 * @param  {String} passwordField  The field containing the password.
 */
exports.hashPassword = function(passwordField = 'password'){
  return function(hook) {
    return new Promise(function(resolve, reject){
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(hook.data[passwordField], salt, function(err, hash) {
          if (err) {
            reject(err);
          } else {
            hook.data[passwordField] = hash;
            resolve(hook);
          }
        });
      });
    });
  };
};
