import Debug from 'debug';
const debug = Debug('feathers-authentication:middleware:failure-redirect');

export default function failureRedirect (options = {}) {
  debug('Registering failureRedirect middleware');

  return function (error, req, res, next) {
    if (options.cookie && options.cookie.enabled) {
      debug(`Clearing old '${options.cookie.name}' cookie`);
      res.clearCookie(options.cookie.name);
    }

    if (res.hook && res.hook.data && res.hook.data.__redirect) {
      const { url, status } = res.hook.data.__redirect;
      debug(`Redirecting to ${url} after failed authentication.`);

      res.status(status || 302);
      return res.redirect(url);
    }

    next(error);
  };
}
