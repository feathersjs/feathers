const { stripSlashes } = require('@feathersjs/commons');

module.exports = () => {
  return context => {
    const { app, params, path, method, app: { authentication } } = context;

    if (stripSlashes(authentication.options.path) === path && method === 'create') {
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
