// The default Express middleware that gets called by the OAuth callback route.
import Debug from 'debug';

const debug = Debug('feathers-authentication-oauth1:handler');

export default function OAuthHandler (options = {}) {
  return function (req, res, next) {
    const app = req.app;
    const authSettings = app.get('auth') || {};
    const entity = req[options.entity];
    const params = {
      authenticated: true,
      [options.entity]: entity
    };

    debug(`Executing '${options.name}' OAuth Callback`);
    debug(`Calling create on '${authSettings.path}' service with`, entity);
    app.service(authSettings.path).create(req[options.entity], params).then(result => {
      res.data = result;

      if (options.successRedirect) {
        req.hook = {
          redirect: { url: options.successRedirect }
        };
      }

      next();
    }).catch(error => {
      if (options.failureRedirect) {
        req.hook = {
          redirect: { url: options.failureRedirect }
        };
      }

      next(error);
    });
  };
}
