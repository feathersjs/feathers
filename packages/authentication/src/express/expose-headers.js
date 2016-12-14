import Debug from 'debug';
const debug = Debug('feathers-authentication:express:expose-headers');

export default function () {
  debug('Registering exposeHeaders middleware');

  return function exposeHeaders (req, res, next) {
    debug('Exposing Express headers to hooks and services');
    req.feathers.headers = req.headers;
    next();
  };
}
