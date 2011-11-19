var Class = require('uberclass'), connect = require('connect'), mime = require('mime');

exports.createServer = function() {
	var args = arguments.concat([connect.bodyParser(), connect.query()]);
	return connect.createServer.apply(args);
};

/**
 * Returns a connect middleware with the routes set according
 * to the names in the registry. Populates res.data with the
 * data response from the resource or calls next(error) with
 * the resource error.
 */
var handler = function(registry) {
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
				resource.create(wrapper(req, res, next), req.body, req.query);
			});
			// PUT /:id -> resource.update(cb, id, data, params)
			app.put(uri + '/:id', function(req, res, next) {
				resource.update(wrapper(req, res, next), req.params.id, req.body, req.query);
			});
			// DELETE /:id -> resource.destroy(cb, id, params)
			app.del(uri + '/:id', function(req, res, next) {
				req.resource.destroy(wrapper(req, res, next), req.params.id, req.query);
			});
		});
	});
};

var renderer = function()
{
	return function(req, res, next)
	{
		
	};
};

exports.handler = function(config) {
	return function(registry) {
		connect.createServer(
			connect.bodyParser(),
			connect.query(),
			handler(registry),
			function(req, res) {
				res.end(JSON.stringify(res.data));
		}).listen(8080);
	};
};
