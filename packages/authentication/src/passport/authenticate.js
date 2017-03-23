/*
 * An authentication function that is called by
 * app.authenticate. Inspired by
 * https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js
 */
import makeDebug from 'debug';

const debug = makeDebug('feathers-authentication:passport:authenticate');

export default function authenticate (options = {}) {
  debug('Initializing custom passport authenticate', options);

  // This function is bound by passport and called by passport.authenticate()
  return function (passport, strategies, strategyOptions = {}, callback = () => {}) {
    // This is called by the feathers middleware, hook or socket. The request object
    // is a mock request derived from an http request, socket object, or hook.
    return function (request = {}) {
      return new Promise((resolve, reject) => {
        // TODO (EK): Support transformAuthInfo

        // Allow you to set a location for the success payload.
        // Default is hook.params.user, req.user and socket.user.
        const entity = strategyOptions.entity || strategyOptions.assignProperty || options.entity;
        request.body = request.body || {};
        let strategyName = request.body.strategy;

        if (!strategyName) {
          if (Array.isArray(strategies)) {
            strategyName = strategies[0];
          } else {
            strategyName = strategies;
          }
        }

        if (!strategyName) {
          return reject(new Error(`You must provide an authentication 'strategy'`));
        }

        // Make sure `strategies` is an array, allowing authentication to pass through a chain of
        // strategies.  The first name to succeed, redirect, or error will halt
        // the chain.  Authentication failures will proceed through each strategy in
        // series, ultimately failing if all strategies fail.
        //
        // This is typically used on API endpoints to allow clients to authenticate
        // using their preferred choice of Basic, Digest, token-based schemes, etc.
        // It is not feasible to construct a chain of multiple strategies that involve
        // redirection (for example both Facebook and Twitter), since the first one to
        // redirect will halt the chain.
        if (!Array.isArray(strategies)) {
          strategies = [strategies];
        }

        // Return an error if the client is trying to authenticate with a strategy
        // that the server hasn't allowed for this authenticate call. This is important
        // because it prevents the user from authenticating with a registered strategy
        // that is not being allowed for this authenticate call.
        if (!strategies.includes(strategyName)) {
          return reject(new Error(`Invalid authentication strategy '${strategyName}'`));
        }

        // Get the strategy, which will be used as prototype from which to create
        // a new instance.  Action functions will then be bound to the strategy
        // within the context of the HTTP request/response pair.
        let prototype = passport._strategy(strategyName);

        if (!prototype) {
          return reject(new Error(`Unknown authentication strategy '${strategyName}'`));
        }

        // Implement required passport methods that
        // can be called by a passport strategy.
        let strategy = Object.create(prototype);

        strategy.redirect = (url, status = 302) => {
          debug(`'${strategyName}' authentication redirecting to`, url, status);
          resolve({ redirect: true, url, status });
        };

        strategy.fail = (challenge, status) => {
          debug(`Authentication strategy '${strategyName}' failed`, challenge, status);
          resolve({
            fail: true,
            challenge,
            status
          });
        };

        strategy.error = error => {
          debug(`Error in '${strategyName}' authentication strategy`, error);
          reject(error);
        };

        strategy.success = (data, payload) => {
          debug(`'${strategyName}' authentication strategy succeeded`, data, payload);
          resolve({
            success: true,
            data: {
              [entity]: data,
              payload
            }
          });
        };

        strategy.pass = () => {
          debug(`Passing on '${strategyName}' authentication strategy`);
          resolve();
        };

        debug('Passport request object', request);
        strategy.authenticate(request, strategyOptions);
      });
    };
  };
}
