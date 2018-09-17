const debug = require('debug')('@feathersjs/authentication/passport');

module.exports = options => {
  debug('Initializing Feathers passport adapter', options);

  return {
    initialize (passport) {
      passport._feathers = {};
      passport.options = function (name, strategyOptions) {
        if (!name) {
          return passport._feathers;
        }

        if (strategyOptions) {
          debug(`Setting ${name} strategy options`, strategyOptions);
          passport._feathers[name] = Object.assign({}, strategyOptions);
        }

        return passport._feathers[name];
      };
    },

    authenticate (passport, strategies, strategyOptions = {}) {
      return function (request = {}) {
        return new Promise((resolve, reject) => {
          const entity = strategyOptions.entity || strategyOptions.assignProperty || options.entity;
          request.body = request.body || {};
          let strategyName = request.body.strategy;

          if (!strategyName) {
            strategyName = Array.isArray(strategies) ? strategies[0] : strategies;
          }

          if (!strategyName) {
            return reject(new Error(`You must provide an authentication 'strategy'`));
          }

          if (!Array.isArray(strategies)) {
            strategies = [ strategies ];
          }

          if (!strategies.includes(strategyName)) {
            return reject(new Error(`Invalid authentication strategy '${strategyName}'`));
          }

          let prototype = passport._strategy(strategyName);

          if (!prototype) {
            return reject(new Error(`Unknown authentication strategy '${strategyName}'`));
          }

          const strategy = Object.assign(Object.create(prototype), {
            redirect (url, status = 302) {
              debug(`'${strategyName}' authentication redirecting to`, url, status);
              resolve({ redirect: true, url, status });
            },

            fail (challenge, status) {
              debug(`Authentication strategy '${strategyName}' failed`, challenge, status);
              resolve({
                fail: true,
                challenge,
                status
              });
            },

            error (error) {
              debug(`Error in '${strategyName}' authentication strategy`, error);
              reject(error);
            },

            success (data, payload) {
              debug(`'${strategyName}' authentication strategy succeeded`, data, payload);
              resolve({
                success: true,
                data: {
                  [entity]: data,
                  payload
                }
              });
            },

            pass () {
              debug(`Passing on '${strategyName}' authentication strategy`);
              resolve();
            }
          });

          debug('Passport request object', request);
          strategy.authenticate(request, strategyOptions);
        });
      };
    }
  };
};
