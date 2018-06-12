const Router = require('radix-router');
const { stripSlashes } = require('@feathersjs/commons');
const ROUTER = Symbol('@feathersjs/transport-commons/router');

module.exports = function () {
  return app => {
    if (typeof app.lookup === 'function') {
      return;
    }

    const router = new Router();

    Object.assign(app, {
      [ROUTER]: router,
      lookup (path) {
        if (!path) {
          return null;
        }

        return this[ROUTER].lookup(stripSlashes('' + path));
      }
    });

    // Add a mixin that registers a service on the router
    app.mixins.push((service, path) => {
      app[ROUTER].insert({ path, service });
      app[ROUTER].insert({
        path: `${path}/:__id`,
        service
      });
    });
  };
};

module.exports.ROUTER = ROUTER;
