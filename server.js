var connect = require('connect'), url = require('url'), Class = require('js-class');

Class.extend('ServiceHandler', {}, {
	init : function(service, app)
	{
		app.get('/user', this.callback('index'));
		app.get('/user/:id', this.callback('get'));
		app.post('/user', this.callback('post'));
		app.put('/user/:id', this.callback('put'));
		app.del('/user/:id', this.callback('del'));
	},
	
	queryParams : function(req)
	{
		return url.parse(req.url, true).query;
	},
	
	get : function(req, res, next)
	{
		
		params.query
		res.end('Hi there ' + req.params.id);
	},
	
	post : function(req, res, next)
	{
		// req.body
	},
	
	put : function(req, res, next)
	{
		// req.params.id
		// req.body
	},
	
	del : function(req, res, next)
	{
		// req.params.id
	}
});

module.exports.service = function(name, service)
{
	connect.router(function(app) {
		
	});
}

var resource = {
	index : function(cb, params)
	{
		
	},
	
	get : function(cb, id, params)
	{
		
	},
	
	update : function(cb, id, data, params)
	{
		
	},
	
	create : function(cb, data, params)
	{
		
	},
	
	destroy : function(cb, id, params)
	{
		
	}
};