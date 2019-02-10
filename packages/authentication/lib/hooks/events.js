const debug = require('debug')('@feathersjs/authentication/hooks/events');
const EVENTS = {
  create: 'login',
  remove: 'logout'
};

module.exports = () => {
  return context => {
    const { method, app, result, params } = context;
    const event = EVENTS[method];

    if (event && params.provider && result) {
      debug(`Sending authentication event '${event}'`);
      app.emit(event, result, params, context);
    }

    return context;
  };
};
