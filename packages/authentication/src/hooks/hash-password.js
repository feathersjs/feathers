import errors from 'feathers-errors';
import bcrypt from 'bcryptjs';


const defaults = { passwordField: 'password' };

export default function (options = {}) {
  return function (hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'hashPassword' hook should only be used as a 'before' hook.`);
    }

    options = Object.assign({}, defaults, hook.app.get('auth'), options);

    const crypto = options.bcrypt || bcrypt;

    if (hook.data === undefined) {
      return hook;
    }

    let password;
    if (Array.isArray(hook.data)) {
      // make sure we actually have password fields
      const dataToCheck = [].concat(hook.data);
      dataToCheck.filter(item => {
        return item.hasOwnProperty(options.passwordField);
      });
      if (dataToCheck.length > 0) {
        // set it to the array so we can iterate later on it
        password = hook.data;
      }
    } else {
      password = hook.data[options.passwordField];
    }

    if (password === undefined) {
      if (!hook.params.provider) {
        return hook;
      }

      throw new errors.BadRequest(`'${options.passwordField}' field is missing.`);
    }

    return new Promise(function (resolve, reject) {
      const hash = function(item, password, salt) {
        crypto.hash(password, salt, function (error, hash) {
          if (error) {
            return reject(error);
          }
          item[options.passwordField] = hash;
          resolve(hook);
        });
      };
      crypto.genSalt(10, function (error, salt) {
        if (Array.isArray(password)) {
          password.map((item) => {
            if (!item.hasOwnProperty(options.passwordField)) {
              return false;
            }
            hash(item, item[options.passwordField], salt);
          });
        } else {
          hash(hook.data, password, salt);
        }
      });
    });
  };
}
