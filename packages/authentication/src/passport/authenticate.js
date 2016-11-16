/*
 * An authentication function that is called by
 * app.authenticate. Inspired by
 * https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js
 */
import makeDebug from 'debug';

const debug = makeDebug('feathers-authentication:passport:authenticate');

export default function authenticate (options = {}) {
  const app = this;

  debug('Initializing custom passport authenticate', options);

  // This function is bound by passport and called by passport.authenticate()
  return function (passport, name, strategyOptions = {}, callback = () => {}) {
    debug('passport.authenticate called with the following options', passport, name, strategyOptions, callback);
    
    // This is called by the feathers middleware, hook or socket. The request object
    // is a mock request derived from an http request, socket object, or hook.
    return function (request = {}) {
      return new Promise((resolve, reject) => {
        // TODO (EK): Support transformAuthInfo
        
        // Allow you to set a location for the success payload.
        // Default is hook.params.user, req.user and socket.user.
        const entity = strategyOptions.entity || strategyOptions.assignProperty || options.entity;
        let failures = [];
        let strategies = [name];

        // Cast `name` to an array, allowing authentication to pass through a chain of
        // strategies.  The first name to succeed, redirect, or error will halt
        // the chain.  Authentication failures will proceed through each strategy in
        // series, ultimately failing if all strategies fail.
        //
        // This is typically used on API endpoints to allow clients to authenticate
        // using their preferred choice of Basic, Digest, token-based schemes, etc.
        // It is not feasible to construct a chain of multiple strategies that involve
        // redirection (for example both Facebook and Twitter), since the first one to
        // redirect will halt the chain.
        if (Array.isArray(name)) {
          strategies = name;
        }

        function attempt(index) {
          const layer = strategies[index];
          
          if (!layer) {
            // If there isn't another strategy then they
            // all failed and we'll return the first failure.
            // TODO (EK): Support passing multiple failures
            return resolve(failures[0]);
          }

          // Get the strategy, which will be used as prototype from which to create
          // a new instance.  Action functions will then be bound to the strategy
          // within the context of the HTTP request/response pair.
          let prototype = passport._strategy(layer);

          if (!prototype) {
            return reject(new Error(`Unknown authentication strategy '${layer}'`));
          }
          

          // Implement required passport methods that
          // can be called by a passport strategy.
          let strategy = Object.create(prototype);

          strategy.redirect = (url, status = 302) => {
            debug(`'${layer}' authentication redirecting to`, url, status);
            resolve({ redirect: true, url, status });
          };

          strategy.fail = (challenge, status) => {
            debug(`Authentication strategy '${layer}' failed`, challenge, status);
            failures.push({
              fail: true,
              challenge,
              status
            });

            // We failed so attempt with next strategy
            attempt(index + 1);
          };
          
          strategy.error = error => {
            debug(`Error in '${layer}' authentication strategy`, error);
            reject(error);
          };

          strategy.success = (data, info) => {
            debug(`'${layer}' authentication strategy succeeded`, data, info);
            resolve({
              success: true,
              data: {
                [entity]: data,
                info
              }
            });
          };

          strategy.pass = () => {
            debug(`Passing on '${layer}' authentication strategy`);
            resolve();
          };

          debug('Passport request object', request);
          strategy.authenticate(request, strategyOptions);
        }

        // Attempt to authenticate with first strategy
        attempt(0);
      });
    };
  };
}