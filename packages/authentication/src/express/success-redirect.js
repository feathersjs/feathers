import Debug from 'debug';
const debug = Debug('feathers-authentication:middleware:success-redirect');

export default function successRedirect() {
  debug('Registering successRedirect middleware');

  return function(req, res, next) {    
    if (req.hook && req.hook.redirect) {
      const { url, status } = req.hook.redirect;
      debug(`Redirecting to ${url} after successful authentication.`);

      res.status(status || 302);
      return res.redirect(url);
    }

    next();
  };
}
