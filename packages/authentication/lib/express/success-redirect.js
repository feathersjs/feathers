const Debug = require('debug');
const debug = Debug('feathers-authentication:middleware:success-redirect');

module.exports = function successRedirect () {
  debug('Registering successRedirect middleware');

  return function (req, res, next) {
    if (res.hook && res.hook.data && res.hook.data.__redirect) {
      const { url, status } = res.hook.data.__redirect;
      debug(`Redirecting to ${url} after successful authentication.`);

      res.status(status || 302);
      return res.redirect(url);
    }

    next();
  };
};
