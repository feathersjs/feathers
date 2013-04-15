var should = require('should');
var connect = require('connect');
var request = require('request');
var injector = require('./../lib/connect-injector');

describe('connect-injector', function () {
	it('does not mess with normal requests', function (done) {
		var rewriter = injector(function () {
			return false;
		}, function () {
			done('Should never be called');
		});

		var app = connect().use(rewriter).use(function (req, res) {
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('Hello World\n');
		});

		var server = app.listen(9999).on('listening', function () {
			request('http://localhost:9999', function (error, response, body) {
				should.not.exist(error);
				response.headers['content-type'].should.equal('text/plain');
				body.should.equal('Hello World\n');
				server.close(done);
			});
		});
	});
});
