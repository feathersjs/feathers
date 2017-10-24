const Debug = require('debug');
const debug = Debug('feathers-authentication:express:expose-cookies');

module.exports = function () {
  debug('Registering exposeCookies middleware');

  return function exposeCookies (req, res, next) {
    debug('Exposing Express cookies to hooks and services', req.cookies);
    req.feathers.cookies = req.cookies;
    next();
  };
};
