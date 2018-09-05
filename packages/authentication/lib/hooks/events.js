const EVENTS = {
  create: 'login',
  remove: 'logout'
};

module.exports = () => {
  return context => {
    const { method, app, result, params } = context;
    const event = EVENTS[method];

    if (event) {
      app.emit(event, result, params, context);
    }

    return context;
  };
};
