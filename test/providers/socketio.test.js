var assert = require('assert');
var feathers = require('../../lib/feathers');
var io = require('socket.io-client');

var fixture = require('./service-fixture');
var todoService = fixture.Service;
var verify = fixture.assert;

describe('SocketIO provider', function () {
	var server, socket;

	before(function(){
		server = feathers()
			.configure(feathers.socketio())
			.use('todo', todoService)
			.listen(3000);

		socket = io.connect('http://localhost:3000');
	});

	after(function(done) {
		socket.disconnect();
		server.close(done);
	});

	describe('CRUD', function() {
		it('::find', function (done) {
			socket.emit('todo::find', {}, function(error, data) {
				verify.find(data);

				done(error);
			});
		});

		it('::get', function (done) {
			socket.emit('todo::get', 'laundry', {}, function(error, data) {
				verify.get('laundry', data);

				done(error);
			});
		});

		it.skip('::create', function() {

		});

		it.skip('::update', function() {

		});

		it.skip('::remove', function() {

		});
	});

	describe('Events', function() {
		it.skip('created', function(done) {

		});

		it.skip('updated', function(done) {

		});

		it.skip('removed', function(done) {

		});
	});
});
