import bcrypt from 'bcrypt';
import errors from 'feathers-errors';

const defaults = { passwordField: 'password' };

export default function(options = {}){
  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'hashPassword' hook should only be used as a 'before' hook.`);
    }

    options = Object.assign({}, defaults, hook.app.get('auth'), options);

    if (hook.data === undefined) {
      return hook;
    }

    const password = hook.data[options.passwordField];

    if (password === undefined) {
      throw new errors.BadRequest(`'${options.passwordField}' field is missing.`);
    }

    return new Promise(function(resolve, reject){
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
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
