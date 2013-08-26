var request = require('request');
var assert = require('assert');
var feathers = require('../../lib/feathers');

var fixture = require('./service-fixture');
var todoService = fixture.Service;
var verify = fixture.assert;

describe('REST provider', function () {
	describe('CRUD', function() {
		var server;

		before(function(){
			server = feathers()
				.use('todo', todoService)
				.listen(3000);
		});

		after(function(done) {
			server.close(done);
		});

		it('GET .find', function (done) {
			request('http://localhost:3000/todo', function (error, response, body) {
				assert.ok(response.statusCode === 200, 'Got OK status code');
				verify.find(JSON.parse(body));
				done(error);
			});
		});

		it('GET .get', function (done) {
			request('http://localhost:3000/todo/dishes', function (error, response, body) {
				assert.ok(response.statusCode === 200, 'Got OK status code');
				verify.get('dishes', JSON.parse(body));
				done(error);
			});
		});

		it.skip('POST .create', function (done) {

		});

		it.skip('PUT .update', function (done) {

		});

		it.skip('DELETE .remove', function (done) {

		});
	});
});
