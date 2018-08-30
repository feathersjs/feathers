const Debug = require('debug');
const debug = Debug('feathers-authentication:express:expose-headers');

module.exports = function () {
  debug('Registering exposeHeaders middleware');

  return function exposeHeaders (req, res, next) {
    debug('Exposing Express headers to hooks and services');
    req.feathers.headers = req.headers;
    next();
  };
};
