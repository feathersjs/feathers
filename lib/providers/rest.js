var _ = require('underscore');
var Proto = require('uberproto');
var wrapper = function (req, res, next) {
	return function (error, data) {
		if (error) {
			return next(error);
		}
		res.data = data;
		return next();
	};
}
var errorMappings = {
	404: 'NotFound'
}
var toUri = function(name) {
	// TODO
	return '/' + name;
}

/**
 * - `middleware` [Function] An express middleware to use for sending the
 * response
 * - `app` [Object] The express application to use
 * - `port` [Integer] The port to listen on
 * - `formatter` [Function] A function that takes the request and response
 * and returns an object for content negotiation formatters.
 * See the [ExpressJS documentation](http://expressjs.com/api.html#res.format)
 * @type {*}
 */
var RestProvider = Proto.extend({
	init: function(configuration) {
		this.configuration = configuration || {};
		this.services = {};
	},

	register: function(path, service) {
		this.services[path] = service;
	},

	_service: function(app, service, path) {
		var uri = toUri(path);
		// TODO throw 405 Method Not Allowed with allowed methods

		// GET / -> resource.index(cb, params)
		app.get(uri, function (req, res, next) {
			service.index(req.query, wrapper(req, res, next));
		});

		// GET /:id -> resource.get(cb, id, params)
		app.get(uri + '/:id', function (req, res, next) {
			service.get(req.params.id, req.query, wrapper(req, res, next));
		});

		// POST -> resource.create(cb, data, params)
		app.post(uri, function (req, res, next) {
			if (!req.body) {
				var error = new Error(415, 'Unsupported Media Type', {
					message : 'Can not parse ' + req.headers['content-type'],
					accepting : Object.keys(res.formatters)
				});
				next(error);
			}
			service.create(req.body, req.query, wrapper(req, res, next));
		});

		// PUT /:id -> resource.update(cb, id, data, params)
		app.put(uri + '/:id', function (req, res, next) {
			if (!req.body) {
				var error = new Error(415, 'Unsupported Media Type', {
					message : 'Can not parse ' + req.headers['content-type'],
					accepting : Object.keys(res.formatters)
				});
				next(error);
			}
			service.update(req.params.id, req.body, req.query, wrapper(req, res, next));
		});

		// DELETE /:id -> resource.destroy(cb, id, params)
		app.del(uri + '/:id', function (req, res, next) {
			service.destroy(req.params.id, req.query, wrapper(req, res, next));
		});
	},

	start: function(server) {
		var config = this.configuration;
		var app = server.configuration.express;
		var responder = function(req, res) {
			res.format(_.extend({
				'application/json': function(){
					res.json(res.data);
				}
			}, config.formatters && config.formatters(req, res)));
		}

		_.each(this.services, _.bind(this._service, this, app));

		app.use(config.middleware || responder);
		app.use(config.errorHandler || function(error, req, res) {
			res.status(500);
			res.data = { error: error };
			responder(req, res);
		});

		server.http();

		return this;
	}
});

module.exports = RestProvider;
