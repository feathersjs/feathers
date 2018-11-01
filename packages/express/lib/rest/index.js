const { stripSlashes } = require('@feathersjs/commons');
const debug = require('debug')('@feathersjs/express/rest');
const getHandler = require('./getHandler');

const HTTP_METHOD = Symbol('@feathersjs/express/rest/HTTP_METHOD');

const httpMethod = (verb, uris) => method => {
  Object.defineProperty(method, HTTP_METHOD, {
    enumerable: false,
    configurable: true,
    writable: false,
    value: (Array.isArray(uris) ? uris : [uris])
      .reduce(
        (result, uri) => ([...result, { verb, uri }]),
        method[HTTP_METHOD] || []
      )
  });

  return method;
};

function getServiceRoutes (service, path, defaultRoutes) {
  const { methods } = service;

  const getDefaultUri = methodName => methods[methodName].indexOf('id') === -1
    ? `/${path}/${methodName}`
    : `/${path}/:__feathersId/${methodName}`;

  return Object.keys(methods)
    .filter(methodName => (service[methodName] && service[methodName][HTTP_METHOD]))
    .reduce((result, methodName) => {
      const methodRoutes = (Array.isArray(service[methodName][HTTP_METHOD])
        ? service[methodName][HTTP_METHOD]
        : [service[methodName][HTTP_METHOD]])
        .map(methodRoute => ({
          method: methodName,
          verb: methodRoute.verb,
          uri: methodRoute.uri ? `/${path}/${stripSlashes(methodRoute.uri)}` : getDefaultUri(methodName)
        }));

      return [
        ...result,
        ...methodRoutes
      ];
    }, defaultRoutes);
};

const getDefaultRoutes = uri => {
  const idUri = `${uri}/:__feathersId`;

  return [
    { method: 'find', verb: 'GET', uri }, // find(params)
    { method: 'get', verb: 'GET', uri: idUri }, // get(id, params)
    { method: 'create', verb: 'POST', uri }, // create(data, params)
    { method: 'patch', verb: 'PATCH', uri: idUri }, // patch(id, data, params)
    { method: 'patch', verb: 'PATCH', uri }, // patch(null, data, params)
    { method: 'update', verb: 'PUT', uri: idUri }, // update(id, data, params)
    { method: 'update', verb: 'PUT', uri }, // update(null, data, params)
    { method: 'remove', verb: 'DELETE', uri: idUri }, // remove(id, data, params)
    { method: 'remove', verb: 'DELETE', uri } // remove(null, data, params)
  ];
};

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

    app.rest = {
      find: getHandler('find'),
      get: getHandler('get'),
      create: getHandler('create'),
      update: getHandler('update'),
      patch: getHandler('patch'),
      remove: getHandler('remove')
    };

    app.use(function (req, res, next) {
      req.feathers = { provider: 'rest' };
      next();
    });

    // Register the REST provider
    app.providers.push(function (service, path, options) {
      const uri = `/${path}`;

      let { middleware } = options;
      let { before, after } = middleware;

      if (typeof handler === 'function') {
        after = after.concat(handler);
      }

      debug(`Adding REST provider for service \`${path}\` at base route \`${uri}\``);

      const routes = getServiceRoutes(service, path, getDefaultRoutes(uri));
      const routesStore = {};

      for (const { method, verb, uri: routeUri } of routes) {
        routesStore[routeUri] = routesStore[routeUri] || app.route(routeUri);

        routesStore[routeUri][verb.toLowerCase()](
          ...before,
          getHandler(method)(service, routes),
          ...after
        );
      }
    });
  };
}

rest.formatter = formatter;
rest.httpMethod = httpMethod;
rest.HTTP_METHOD = HTTP_METHOD;

module.exports = rest;
