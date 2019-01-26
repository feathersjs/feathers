const Debug = require('debug');

const debug = Debug('feathers-authentication:express:emit-events');

module.exports = function emitEvents (settings, _app) {
  return function (req, res, next) {
    const method = res.hook && res.hook.method;

    let event = null;

    if (method === 'remove') {
      event = 'logout';
    } else if (method === 'create') {
      event = 'login';
    }

    if (res.data && res.data.accessToken && event) {
      const app = req.app && typeof req.app.emit === 'function' ? req.app : _app;

      debug(`Sending '${event}' event for REST provider. Token is`, res.data.accessToken);

      app.emit(event, res.data, {
        provider: 'rest',
        req,
        res
      });
    }

    next();
  };
};
