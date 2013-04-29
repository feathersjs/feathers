var assert = require('assert');
var MemoryService = require('../../lib/service/memory');
var Proto = require('uberproto');

describe('Memory Service', function () {
	it('create', function (done) {
		var service = Proto.create.call(MemoryService);
		service.create({
			name: 'Test 1'
		}, {}, function(error, data) {
			assert.equal(data.id, 0);
			assert.equal(data.name, 'Test 1');
			done();
		});
	});

	it('index', function(done) {
		var service = Proto.create.call(MemoryService);
		for(var i = 0; i < 20; i++) {
			service.create({
				name: 'Test ' + i
			}, {}, function(error, data) {

			});
		}
	});

	it('creates indexes and gets items', function (done) {
		var service = Proto.create.call(MemoryService);
		service.create({
			name: 'Test 1'
		}, {}, function() {
			service.create({
				name: 'Test 2'
			}, {}, function(error, data) {
				assert.equal(data.id, 1);
				assert.equal(data.name, 'Test 2');
				service.index({}, function(error, items) {
					assert.ok(Array.isArray(items));
					assert.equal(items.length, 2);
					service.get(0, {}, function(error, data) {
						assert.equal(data.id, 0);
						assert.equal(data.name, 'Test 1');
						done();
					});
				});
			});
		});
	});
});
