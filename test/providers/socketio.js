var assert = require('assert');
var request = require('request');
var feathry = require('../../lib/feathry');
var io = require('socket.io-client');

describe('SocketIO provider', function () {
	it('get', function (done) {
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
			.provide(feathry.socketio())
			.start();

		var socket = io.connect('http://localhost:8000');

		done();
	});
});
