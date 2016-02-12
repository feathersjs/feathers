import bcrypt from 'bcrypt';

/**
 * Replaces a password located at the provided `passwordField` with a hash
 * of the password.
 * @param  {String} passwordField  The field containing the password.
 */
export default function(options = {}){
  const defaults = {passwordField: 'password'};
  options = Object.assign({}, defaults, options);

  return function(hook) {
    if (!hook.data || !hook.data[options.passwordField]) {
      return hook;
    }

    return new Promise(function(resolve, reject){
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(hook.data[options.passwordField], salt, function(err, hash) {
          if (err) {
            return reject(err);
          }
          
          hook.data[options.passwordField] = hash;
          resolve(hook);
        });
      });
    });
  };
}
