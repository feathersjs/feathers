const makeDebug = require('debug');
const wrappers = require('./wrappers');

const debug = makeDebug('@feathersjs/express/rest');

function formatter (req, res, next) {
  if (res.data === undefined) {
    return next();
  }

  res.format({
    'application/json': function () {
      res.json(res.data);
    }
  });
}

function rest (handler = formatter) {
  return function () {
    const app = this;

    if (typeof app.route !== 'function') {
      throw new Error('@feathersjs/express/rest needs an Express compatible app. Feathers apps have to wrapped with feathers-express first.');
    }

    if (!app.version || app.version < '3.0.0') {
      throw new Error(`@feathersjs/express/rest requires an instance of a Feathers application version 3.x or later (got ${app.version})`);
    }

    app.rest = wrappers;

    app.use(function (req, res, next) {
      req.feathers = { provider: 'rest' };
      next();
    });

    // Register the REST provider
    app.providers.push(function (service, path, options) {
      const uri = `/${path}`;
      const baseRoute = app.route(uri);
      const idRoute = app.route(`${uri}/:__feathersId`);

      let { middleware } = options;
      let { before, after } = middleware;

      if (typeof handler === 'function') {
        after = after.concat(handler);
      }

      debug(`Adding REST provider for service \`${path}\` at base route \`${uri}\``);

      // GET / -> service.find(params)
      baseRoute.get(...before, app.rest.find(service), ...after);
      // POST / -> service.create(data, params)
      baseRoute.post(...before, app.rest.create(service), ...after);
      // PATCH / -> service.patch(null, data, params)
      baseRoute.patch(...before, app.rest.patch(service), ...after);
      // PUT / -> service.update(null, data, params)
      baseRoute.put(...before, app.rest.update(service), ...after);
      // DELETE / -> service.remove(null, params)
      baseRoute.delete(...before, app.rest.remove(service), ...after);

      // GET /:id -> service.get(id, params)
      idRoute.get(...before, app.rest.get(service), ...after);
      // PUT /:id -> service.update(id, data, params)
      idRoute.put(...before, app.rest.update(service), ...after);
      // PATCH /:id -> service.patch(id, data, params)
      idRoute.patch(...before, app.rest.patch(service), ...after);
      // DELETE /:id -> service.remove(id, params)
      idRoute.delete(...before, app.rest.remove(service), ...after);
    });
  };
}

rest.formatter = formatter;

module.exports = rest;
