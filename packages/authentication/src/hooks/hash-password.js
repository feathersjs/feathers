import errors from 'feathers-errors';
import bcrypt from 'bcryptjs';


const defaults = { passwordField: 'password' };

export default function(options = {}){
  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'hashPassword' hook should only be used as a 'before' hook.`);
    }

    options = Object.assign({}, defaults, hook.app.get('auth'), options);

    const crypto = options.bcrypt || bcrypt;

    if (hook.data === undefined) {
      return hook;
    }

    const password = hook.data[options.passwordField];

    if (password === undefined) {
      if (!hook.params.provider) {
        return hook;
      }

      throw new errors.BadRequest(`'${options.passwordField}' field is missing.`);
    }

    return new Promise(function(resolve, reject){
      crypto.genSalt(10, function(error, salt) {
        crypto.hash(password, salt, function(error, hash) {
          if (error) {
            return reject(error);
          }

          hook.data[options.passwordField] = hash;
          resolve(hook);
        });
      });
    });
  };
}
