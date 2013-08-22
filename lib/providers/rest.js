var _ = require('underscore');
var errors = require('../errors');
var Proto = require('uberproto');

var wrapper = function (req, res, next) {
	return function (error, data) {
		if (error) {
			return next(error);
		}
		res.data = data;
		return next();
	};
};
var errorMappings = {
	404: 'NotFound'
};
var toUri = function(name) {
	// TODO
	return '/' + name;
};

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
	init: function(config) {
		this.config = config || {};
		this.services = {};
	},

	register: function(path, service) {
		this.services[path] = service;
	},

	_getParams: function(req) {
		var query = req.query || {};
		return _.extend({ query: query }, req.feathers);
	},

	_service: function(app, service, path) {
		var uri = toUri(path);
		var self = this;
		// TODO throw 405 Method Not Allowed with allowed methods

		// GET / -> resource.index(cb, params)
		app.get(uri, function (req, res, next) {
			service.find(self._getParams(req), wrapper(req, res, next));
		});

		// GET /:id -> resource.get(cb, id, params)
		app.get(uri + '/:id', function (req, res, next) {
			service.get(req.params.id, self._getParams(req), wrapper(req, res, next));
		});

		// POST -> resource.create(cb, data, params)
		app.post(uri, function (req, res, next) {
			service.create(req.body, self._getParams(req), wrapper(req, res, next));
		});

		// PUT /:id -> resource.update(cb, id, data, params)
		app.put(uri + '/:id', function (req, res, next) {
			service.update(req.params.id, req.body, self._getParams(req), wrapper(req, res, next));
		});

		// DELETE /:id -> resource.destroy(cb, id, params)
		app.del(uri + '/:id', function (req, res, next) {
			service.destroy(req.params.id, self._getParams(req), wrapper(req, res, next));
		});
	},

	start: function(server) {
		var config = this.config;

		var _responder = function(req, res) {
			res.format(_.extend({
				'application/json': function(){
					res.json(res.data);
				}
			}, config.formatters && config.formatters(req, res)));
		};

		var _errorHandler = function(error, req, res) {
			res.status(500);
			res.data = { error: error };
			responder(req, res);
		};

		// TODO (EK): We might not need this explicit use of express body parser. 
		// We might just be able to use config because it is either passed 
		// through the engine or our default engine (wich is express).
		// server.use(config.bodyParser || server.config.engine.bodyParser());
		_.each(this.services, _.bind(this._service, this, server));

		server.use(config.handler || _responder);
		server.use(config.errorHandler || _errorHandler);

		console.log('Feathers REST provider initialized');

		return this;
	}
});

module.exports = RestProvider;
