/**
 * User: daff (12-02-29 10:53 AM)
 */

var restify = require('restify'),
	wrapper = function (req, res, next)
	{
		return function (error, data)
		{
			if (error) {
				return next(error);
			}
			res.data = data;
			return next();
		};
	},
	checkAllowed = function (resource, name)
	{
		if (typeof resource[name] != 'function') {
			// TODO also return a list of allowed methods
			// Allow: GET, HEAD, PUT
			throw new restify.BadMethod('Method ' + name + ' is not supported');
		}
	},
	resource = function (name, resource)
	{
		var uri = '/' + name, self = this;

		// TODO throw 405 Method Not Allowed with allowed methods

		// GET / -> resource.index(cb, params)
		this.get(uri, function (req, res, next)
		{
			resource.index(wrapper(req, res, next), req.query);
		});

		// GET /:id -> resource.get(cb, id, params)
		this.get(uri + '/:id', function (req, res, next)
		{
			resource.get(wrapper(req, res, next), req.params.id, req.query);
		});

		// POST -> resource.create(cb, data, params)
		this.post(uri, function (req, res, next)
		{
			if (!req.body) {
				var error = restify.codeToHttpError(415, 'Unsupported Media Type', {
					message : 'Can not parse ' + req.headers['content-type'],
					accepting : Object.keys(res.formatters)
				});
				next(error);
			}
			resource.create(wrapper(req, res, next), req.body, req.query);
		});

		// PUT /:id -> resource.update(cb, id, data, params)
		this.put(uri + '/:id', function (req, res, next)
		{
			if (!req.body) {
				var error = restify.codeToHttpError(415, 'Unsupported Media Type', {
					message : 'Can not parse ' + req.headers['content-type'],
					accepting : Object.keys(res.formatters)
				});
				next(error);
			}
			resource.update(wrapper(req, res, next), req.params.id, req.body, req.query);
		});

		// DELETE /:id -> resource.destroy(cb, id, params)
		this.del(uri + '/:id', function (req, res, next)
		{
			resource.destroy(wrapper(req, res, next), req.params.id, req.query);
		});

		return this;
	}

exports.createServer = function (options)
{
	var server = restify.createServer(options);
	server.use(restify.acceptParser(server.acceptable))
		.use(restify.queryParser())
		.use(restify.authorizationParser())
		.use(restify.bodyParser({ mapParams : false }));
	server.resource = resource;
	return server;
};

exports.defaultRenderer = function ()
{
	return function (req, res, next)
	{
		res.send(res.data);
	};
}