import errors from 'feathers-errors';
import Debug from 'debug';
const debug = Debug('feathers-authentication:hooks:authenticate');

export default function authenticate (strategy, options = {}) {
  // TODO (EK): Handle chaining multiple strategies

  if (!strategy) {
    throw new Error(`The 'authenticate' hook requires one of your registered passport strategies.`);
  }

  return function (hook) {
    const app = hook.app;

    // If called internally or we are already authenticated skip
    if (!hook.params.provider || hook.params.authenticated) {
      return Promise.resolve(hook);
    }

    if (hook.type !== 'before') {
      return Promise.reject(new Error(`The 'authenticate' hook should only be used as a 'before' hook.`));
    }

    // if (!hook.app.passport._strategy(strategy)) {
    //   return Promise.reject(new Error(`Your '${strategy}' authentication strategy is not registered with passport.`));
    // }
    
    // NOTE (EK): Passport expects an express/connect
    // like request object. So we need to create on.
    let request = {
      query: hook.data,
      body: hook.data,
      params: hook.params,
      headers: hook.params.headers || {},
      cookies: hook.params.cookies || {},
      session: {}
    };

    return app.authenticate(strategy, options)(request).then((result = {}) => {
      if (result.fail) {
        // TODO (EK): Reject with something...
        // You get back result.challenge and result.status
        if (options.failureRedirect) {
          // hook.result = true
          hook.redirect = {
            status: 302,
            url: options.failureRedirect
          };
        }

        const { challenge, status = 401 } = result;
        let message = challenge && challenge.message ? challenge.message : challenge;

        if (options.failureMessage) {
          message = options.failureMessage;
        }
        
        return Promise.reject(new errors[status](message, challenge));
      }

      if (result.success) {
        hook.params = Object.assign({ authenticated: true }, hook.params, result.data);

        if (options.successRedirect) {
          // TODO (EK): Bypass the service?
          // hook.result = true
          hook.redirect = {
            status: 302,
            url: options.successRedirect
          };
        }
      } else if (result.redirect) {
        // TODO (EK): Bypass the service?
        // hook.result = true
        hook.redirect = {
          status: result.status,
          url: result.url
        };
      }

      return Promise.resolve(hook);
    });
  };
}