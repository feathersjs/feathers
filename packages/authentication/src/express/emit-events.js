import Debug from 'debug';

const debug = Debug('feathers-authentication:express:emit-events');

export default function emitEvents () {
  return function (req, res, next) {
    const method = res.hook && res.hook.method;

    let event = null;

    if (method === 'remove') {
      event = 'logout';
    } else if (method === 'create') {
      event = 'login';
    }

    if (res.data && res.data.accessToken && event) {
      const { app } = req;

      debug(`Sending '${event}' event for REST provider. Token is`, res.data.accessToken);

      app.emit(event, res.data, {
        provider: 'rest',
        req,
        res
      });
    }

    next();
  };
}
