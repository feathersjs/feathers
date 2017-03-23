import errors from 'feathers-errors';
import Debug from 'debug';
import merge from 'lodash.merge';
const debug = Debug('feathers-authentication:hooks:authenticate');

export default function authenticate (strategies, options = {}) {
  if (!strategies) {
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

    hook.data = hook.data || {};

    let { strategy } = hook.data;
    if (!strategy) {
      if (Array.isArray(strategies)) {
        strategy = strategies[0];
      } else {
        strategy = strategies;
      }
    }

    // Handle the case where authenticate hook was registered without a passport strategy specified
    if (!strategy) {
      return Promise.reject(new errors.GeneralError(`You must provide an authentication 'strategy'`));
    }

    // The client must send a `strategy` name.
    if (!app.passport._strategy(strategy)) {
      return Promise.reject(new errors.BadRequest(`Authentication strategy '${strategy}' is not registered.`));
    }

    // NOTE (EK): Passport expects an express/connect
    // like request object. So we need to create one.
    let request = {
      query: hook.data,
      body: hook.data,
      params: hook.params,
      headers: hook.params.headers || {},
      cookies: hook.params.cookies || {},
      session: {}
    };

    const strategyOptions = merge({}, app.passport.options(strategy), options);

    debug(`Attempting to authenticate using ${strategy} strategy with options`, strategyOptions);

    return app.authenticate(strategy, strategyOptions)(request).then((result = {}) => {
      if (result.fail) {
        // TODO (EK): Reject with something...
        // You get back result.challenge and result.status
        if (strategyOptions.failureRedirect) {
          // TODO (EK): Bypass the service?
          // hook.result = true
          Object.defineProperty(hook.data, '__redirect', { value: { status: 302, url: strategyOptions.failureRedirect } });
        }

        const { challenge, status = 401 } = result;
        let message = challenge && challenge.message ? challenge.message : challenge;

        if (strategyOptions.failureMessage) {
          message = strategyOptions.failureMessage;
        }

        return Promise.reject(new errors[status](message, challenge));
      }

      if (result.success) {
        hook.params = Object.assign({ authenticated: true }, hook.params, result.data);

        // Add the user to the original request object so it's available in the socket handler
        Object.assign(request.params, hook.params);

        if (strategyOptions.successRedirect) {
          // TODO (EK): Bypass the service?
          // hook.result = true
          Object.defineProperty(hook.data, '__redirect', { value: { status: 302, url: strategyOptions.successRedirect } });
        }
      } else if (result.redirect) {
        // TODO (EK): Bypass the service?
        // hook.result = true
        Object.defineProperty(hook.data, '__redirect', { value: { status: result.status, url: result.url } });
      }

      return Promise.resolve(hook);
    });
  };
}
