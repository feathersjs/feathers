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
        const { accessToken } = authResult;

        context.params = Object.assign({ authResult }, params);

        // Set REST header if necessary
        if (app.rest && accessToken) {
          const { scheme, header } = authentication.options;
          const authHeader = `${scheme} ${accessToken}`;

          context.params.headers = Object.assign({}, {
            [header]: authHeader
          }, context.params.headers);
        }
      }

      return context;
    });
  };
};
