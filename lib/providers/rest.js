var Proto = require('uberproto');
var express = require('express');

var wrapper = function (req, res, next) {
	return function (error, data) {
		if (error) {
			return next(error);
		}
		res.data = data;
		return next();
	};
}


var toUri = function(name) {
	// TODO
	return '/' + name;
}

var RestProvider = Proto.extend({
	init: function(configuration) {
		this.configuration = configuration;
		this.app = configuration.app || express();
	},

	register: function(path, service) {
		var uri = toUri(path);
		var server = this.app;

		// TODO throw 405 Method Not Allowed with allowed methods

		// GET / -> resource.index(cb, params)
		server.get(uri, function (req, res, next) {
			service.index(wrapper(req, res, next), req.query);
		});

		// GET /:id -> resource.get(cb, id, params)
		server.get(uri + '/:id', function (req, res, next) {
			service.get(wrapper(req, res, next), req.params.id, req.query);
		});

		// POST -> resource.create(cb, data, params)
		server.post(uri, function (req, res, next) {
			if (!req.body) {
				var error = restify.codeToHttpError(415, 'Unsupported Media Type', {
					message : 'Can not parse ' + req.headers['content-type'],
					accepting : Object.keys(res.formatters)
				});
				next(error);
			}
			service.create(wrapper(req, res, next), req.body, req.query);
		});

		// PUT /:id -> resource.update(cb, id, data, params)
		server.put(uri + '/:id', function (req, res, next) {
			if (!req.body) {
				var error = restify.codeToHttpError(415, 'Unsupported Media Type', {
					message : 'Can not parse ' + req.headers['content-type'],
					accepting : Object.keys(res.formatters)
				});
				next(error);
			}
			service.update(wrapper(req, res, next), req.params.id, req.body, req.query);
		});

		// DELETE /:id -> resource.destroy(cb, id, params)
		server.del(uri + '/:id', function (req, res, next) {
			service.destroy(wrapper(req, res, next), req.params.id, req.query);
		});
	},

	start: function() {
		this.app.use(function(req, res) {
			res.json(res.data);
		});
		return this.app.listen(this.configuration.port);
	}
});

module.exports = RestProvider;
