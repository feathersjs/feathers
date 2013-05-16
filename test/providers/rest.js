var assert = require('assert');
var request = require('request');
var feathry = require('../../lib/feathry');

describe('REST provider', function () {
	it('GET', function (done) {
		var todoService = {
			get: function(name, params, callback) {
				callback(null, {
					id: name,
					description: "You have to do " + name + "!"
				});
			}
		};

		var server = feathry.createServer({ port: 8000 })
			.service('todo', todoService)
			.provide(feathry.rest())
			.provide(feathry.socketio())
			.start();

		request('http://localhost:8000/todo/dishes', function (error, response, body) {
			server.stop();
			done();
		})
	});

	it('PUT', function (done) {
		var todoService = {
			get: function(name, params, callback) {
				callback(null, {
					id: name,
					description: "You have to do " + name + "!"
				});
			}
		};

		var server = feathry.createServer({ port: 8000 })
			.service('todo', todoService)
			.provide(feathry.rest())
			.start();

		request('http://localhost:8000/todo/dishes', function (error, response, body) {
			console.log(arguments);
			server.stop();
			done();
		})
	});
});
