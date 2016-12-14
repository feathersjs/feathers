import errors from 'feathers-errors';
import Debug from 'debug';
const debug = Debug('feathers-authentication:express:authenticate');

export default function authenticate (strategy, options = {}) {
  // TODO (EK): Support arrays of strategies

  if (!strategy) {
    throw new Error(`The 'authenticate' hook requires one of your registered passport strategies.`);
  }

  return function (req, res, next) {
    // If we are already authenticated skip
    if (req.authenticated) {
      return next();
    }

    // if (!req.app.passport._strategy(strategy)) {
    //   return next(new Error(`Your '${strategy}' authentication strategy is not registered with passport.`));
    // }
    // TODO (EK): Can we do something in here to get away
    // from express-session for OAuth1?
    // TODO (EK): Handle chaining multiple strategies
    req.app.authenticate(strategy, options)(req).then((result = {}) => {
      // TODO (EK): Support passport failureFlash
      // TODO (EK): Support passport successFlash
      if (result.success) {
        Object.assign(req, { authenticated: true }, result.data);
        Object.assign(req.feathers, { authenticated: true }, result.data);

        if (options.successRedirect && !options.__oauth) {
          debug(`Redirecting to ${options.successRedirect}`);
          res.status(302);
          return res.redirect(options.successRedirect);
        }

        return next();
      }

      if (result.fail) {
        if (options.failureRedirect && !options.__oauth) {
          debug(`Redirecting to ${options.failureRedirect}`);
          res.status(302);
          return res.redirect(options.failureRedirect);
        }

        const { challenge, status = 401 } = result;
        let message = challenge && challenge.message ? challenge.message : challenge;

        if (options.failureMessage) {
          message = options.failureMessage;
        }

        res.status(status);
        return Promise.reject(new errors[status](message, challenge));
      }

      if (result.redirect) {
        debug(`Redirecting to ${result.url}`);
        res.status(result.status);
        return res.redirect(result.url);
      }

      // Only gets here if pass() is called by the strategy
      next();
    }).catch(next);
  };
}
