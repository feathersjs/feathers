var expect = require('chai').expect;
var request = require('request');
var feathers = require('../../lib/feathers');
var io = require('socket.io-client');
var _ = require('underscore');

describe('SocketIO provider', function () {
//	it('get', function (done) {
//		var todoService = {
//			get: function(name, params, callback) {
//				callback(null, {
//					id: name,
//					description: 'You have to do ' + name + '!'
//				});
//			}
//		};
//
//		var server = feathers.createServer({ port: 8000 })
//			.service('todo', todoService)
//			.provide(feathers.socketio())
//			.start();
//
//		var socket = io.connect('http://localhost:8000');
//
//		socket.emit('todo::get', 'dishes', {}, function(error, data) {
//			expect(error).to.be.null;
//			expect(data.id).to.equal('dishes');
//			expect(data.description).to.equal('You have to do dishes!');
//			server.stop();
//			done();
//		});
//	});

	it('create and created event', function (done) {
		var todoService = {
			create: function(data, params, callback) {
				_.defer(function() {
					callback(null, data);
				}, 200);
			}
		};

		var server = feathers.createServer({ port: 8000 })
			.service('todo', todoService)
			.provide(feathers.socketio())
			.start();

		var socket = io.connect('http://localhost:8000');

		socket.on('todo created', function(data) {
			expect(data.id).to.equal(1);
			expect(data.name).to.equal('Create dishes');
			server.stop();
			done();
		});

		socket.emit('todo::create', {
			id: 1,
			name: 'Create dishes'
		}, {}, function(error, data) {
			expect(error).to.be.null;
		});
	});
});
