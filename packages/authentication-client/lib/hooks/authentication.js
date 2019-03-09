const { stripSlashes } = require('@feathersjs/commons');

module.exports = () => {
  return context => {
    const { app, params, path, app: { authentication } } = context;

    // Should not run for authentication service
    if (stripSlashes(authentication.options.path) === path) {
      return context;
    }

    return Promise.resolve(app.get('authentication')).then(authResult => {
      if (authResult) {
        context.params = Object.assign({}, authResult, params);
      }

      return context;
    });
  };
};
