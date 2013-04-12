var Proto = require('uberproto');
var express = require('express');
// var io = require('socket.io').listen(80);

var SocketIoProvider = Proto.extend({
	init: function(configuration) {
		this.configuration = configuration;
	},

	register: function(path, resource) {
		app.get('/hello.txt', function(req, res){
			var body = 'Hello World';
			res.setHeader('Content-Type', 'text/plain');
			res.setHeader('Content-Length', body.length);
			res.end(body);
		});
	},

	start: function() {
		// return this.app.listen(this.configuration.port);
	}
});

module.exports = SocketIoProvider;
