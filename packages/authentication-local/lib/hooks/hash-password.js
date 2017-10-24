const hasher = require('../utils/hash');
const merge = require('lodash.merge');
const Debug = require('debug');

const debug = Debug('feathers-authentication-local:hooks:hash-password');

module.exports = function hashPassword (options = {}) {
  return function (hook) {
    if (hook.type !== 'before') {
      return Promise.reject(new Error(`The 'hashPassword' hook should only be used as a 'before' hook.`));
    }

    const app = hook.app;
    const authOptions = app.get('authentication') || {};

    options = merge({ passwordField: 'password' }, authOptions.local, options);

    debug('Running hashPassword hook with options:', options);

    const field = options.passwordField;
    const hashPw = options.hash || hasher;

    if (typeof field !== 'string') {
      return Promise.reject(new Error(`You must provide a 'passwordField' in your authentication configuration or pass one explicitly`));
    }

    if (typeof hashPw !== 'function') {
      return Promise.reject(new Error(`'hash' must be a function that takes a password and returns Promise that resolves with a hashed password.`));
    }

    if (hook.data === undefined) {
      debug(`hook.data is undefined. Skipping hashPassword hook.`);
      return Promise.resolve(hook);
    }

    let data;

    // make sure we actually have password fields
    if (Array.isArray(hook.data)) {
      data = hook.data.filter(item => {
        return item.hasOwnProperty(field);
      });
    } else if (hook.data[field]) {
      data = hook.data;
    }

    // If the data doesn't have a password field
    // then don't attempt to hash it.
    if (data === undefined || (Array.isArray(data) && !data.length)) {
      debug(`'${field}' field is missing. Skipping hashPassword hook.`);
      return Promise.resolve(hook);
    }

    if (Array.isArray(data)) {
      debug(`Hashing passwords.`);

      return Promise.all(data.map(item => {
        return hashPw(item[field]).then(hashedPassword => {
          item[field] = hashedPassword;
          return item;
        });
      }))
      .then(results => {
        hook.data = results;
        return Promise.resolve(hook);
      });
    }

    debug(`Hashing password.`);
    return hashPw(data[field]).then(hashedPassword => {
      hook.data[field] = hashedPassword;
      return Promise.resolve(hook);
    });
  };
};
