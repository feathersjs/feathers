const { get, set, cloneDeep } = require('lodash');
const { BadRequest } = require('@feathersjs/errors');

const debug = require('debug')('@feathersjs/authentication-local/hooks/hash-password');

module.exports = function hashPassword (field, options = {}) {
  if (!field) {
    throw new Error('The hashPassword hook requires a field name option');
  }

  return function (context) {
    if (context.type !== 'before') {
      return Promise.reject(
        new Error(`The 'hashPassword' hook should only be used as a 'before' hook`)
      );
    }

    const { app, data, params } = context;
    const password = get(data, field);

    if (data === undefined || password === undefined) {
      debug(`hook.data or hook.data.${field} is undefined. Skipping hashPassword hook.`);
      return Promise.resolve(context);
    }

    const serviceName = options.authentication || app.get('defaultAuthentication');
    const authService = app.service(serviceName);
    const { strategy = 'local' } = options;

    if (!authService || typeof authService.getStrategies !== 'function') {
      return Promise.reject(
        new BadRequest(`Could not find '${serviceName}' service to hash password`)
      );
    }

    const [ localStrategy ] = authService.getStrategies(strategy);

    if (!localStrategy || typeof localStrategy.hashPassword !== 'function') {
      return Promise.reject(
        new BadRequest(`Could not find '${strategy}' strategy to hash password`)
      );
    }

    return localStrategy.hashPassword(password, params)
      .then(hashedPassword => {
        context.data = set(cloneDeep(data), field, hashedPassword);

        return context;
      });
  };
};
