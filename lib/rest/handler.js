var connect = require('connect'), view = require('./view');

/**
 * Returns a connect middleware with the routes set according
 * to the names in the registry. Populates res.data with the
 * data response from the resource or calls next(error) with
 * the resource error.
 */
var middleware = exports.middleware = function(registry) {
	return connect.router(function(app) {
		registry.forEach(function(name, resource) {
			var uri = '/' + name, 
			wrapper = function(req, res, next) {
				return function(error, data) {
					if(error) {
						next(error);
					} else {
						res.data = data;
						req.uri = uri;
						next();
					}
				};
			},
			resourceInfo = function(method) {
				return {
					instance : resource,
					method : method,
					uri : uri
				}
			};
			
			// TODO throw 405 Method Not Allowed with allowed methods
			
			// GET / -> resource.index(cb, params)
			app.get(uri, function(req, res, next) {
				req.resource = resourceInfo('index');
				resource.index(wrapper(req, res, next), req.query);
			});
			// GET /:id -> resource.get(cb, id, params)
			app.get(uri + '/:id', function(req, res, next) {
				req.resource = resourceInfo('get');
				resource.get(wrapper(req, res, next), req.params.id, req.query);
			});
			// POST -> resource.create(cb, data, params)
			app.post(uri, function(req, res, next) {
				if(!req.body) {
					// TODO add accepted types
					next(new UnsupportedMediaType('Can not parse ' + req.headers['content-type']));
				}
				req.resource = resourceInfo('create');
				resource.create(wrapper(req, res, next), req.body, req.query);
			});
			// PUT /:id -> resource.update(cb, id, data, params)
			app.put(uri + '/:id', function(req, res, next) {
				if(!req.body) {
					// TODO add accepted types
					next(new UnsupportedMediaType('Can not parse ' + req.headers['content-type']));
				}
				req.resource = resourceInfo('update');
				resource.update(wrapper(req, res, next), req.params.id, req.body, req.query);
			});
			// DELETE /:id -> resource.destroy(cb, id, params)
			app.del(uri + '/:id', function(req, res, next) {
				req.resource = resourceInfo('destroy');
				req.resource.destroy(wrapper(req, res, next), req.params.id, req.query);
			});
		});
	});
};

/**
 * Returns a handler function
 * @param config
 * @returns {Function}
 */
exports.handler = function(config) {
	config = config || {};
	var server = config.server || connect.createServer(
		connect.bodyParser(),
		connect.query());
	return function(registry)
	{
		server.use(middleware(registry))
			.use(view.middleware())
			.listen(config.port || 8080);
	};
};
