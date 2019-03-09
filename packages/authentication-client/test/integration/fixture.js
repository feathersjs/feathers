const { authenticate } = require('@feathersjs/authentication');
const getApp = require('@feathersjs/authentication-local/test/fixture');

module.exports = _app => {
  const app = getApp(_app);

  app.use('/dummy', {
    find (params) {
      return Promise.resolve(params);
    }
  });

  app.service('dummy').hooks({
    before: authenticate('jwt')
  });

  app.service('users').hooks({
    before (context) {
      if (context.id !== undefined && context.id !== null) {
        context.id = parseInt(context.id);
      }

      return context;
    }
  });

  return app;
};
