var Class = require('uberclass'), connect = require('connect'), view = require('./view');

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
			};
			
			// TODO throw 405 Method Not Allowed with allowed methods
			
			// GET / -> resource.index(cb, params)
			app.get(uri, function(req, res, next) {
				resource.index(wrapper(req, res, next), req.query);
			});
			// GET /:id -> resource.get(cb, id, params)
			app.get(uri + '/:id', function(req, res, next) {
				resource.get(wrapper(req, res, next), req.params.id, req.query);
			});
			// POST -> resource.create(cb, data, params)
			app.post(uri, function(req, res, next) {
				// TODO throw 415 : Unsupported Media Type if(!req.body)
				resource.create(wrapper(req, res, next), req.body, req.query);
			});
			// PUT /:id -> resource.update(cb, id, data, params)
			app.put(uri + '/:id', function(req, res, next) {
				// TODO throw 415 : Unsupported Media Type if(!req.body)
				resource.update(wrapper(req, res, next), req.params.id, req.body, req.query);
			});
			// DELETE /:id -> resource.destroy(cb, id, params)
			app.del(uri + '/:id', function(req, res, next) {
				req.resource.destroy(wrapper(req, res, next), req.params.id, req.query);
			});
		});
	});
};

exports.handler = function(config) {
	config = config || {};
	return function(registry)
	{
		connect.createServer(
			connect.bodyParser(),
			connect.query(),
			middleware(registry),
			view.middleware())
		.listen(config.port || 8080);
	}
};
