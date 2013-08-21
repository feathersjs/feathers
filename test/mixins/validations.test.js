var assert = require('assert');
var _ = require('underscore');
var Proto = require('uberproto');
var errors = require('../../lib/errors');
var mixinValidation = require('../../lib/mixins/validation');

describe('Validation mixin', function () {
	it('initializes', function () {
		var ValidationService = Proto.extend({
			validate: function(data, params, cb) {
				if(!data.name || data.name === '') {
					return cb({
						name: ['Name can not be empty']
					});
				}
				return cb();
			}
		});

		mixinValidation(ValidationService);

		assert.equal(typeof ValidationService.create, 'function');
		assert.equal(typeof ValidationService.update, 'function');

		var instance = Proto.create.call(ValidationService);
		instance.validate({
			name: 'Test'
		}, {}, function(errors) {
			assert.ok(!errors);
		});

		instance.validate({
			fullName: 'Testing'
		}, {}, function(errors) {
			assert.deepEqual(errors, {
				name: [ 'Name can not be empty' ]
			});
		});
	});

	it('.create', function () {
		var ValidationService = Proto.extend({
			validate: function(data, params, cb) {
				assert.equal(params.validates, 'create');
				if(!data.name || data.name === '') {
					return cb({
						name: ['Name can not be empty']
					});
				}
				return cb();
			},

			create: function(data, params, cb) {
				cb(null, {
					id: 23,
					name: data.name
				});
			}
		});

		mixinValidation(ValidationService);

		var instance = Proto.create.call(ValidationService);
		instance.create({ name: 'Tester' }, {}, function(error, data) {
			assert.ok(!error);
			assert.equal(data.id, 23);
		});

		instance.create({ fullName: 'Tester' }, {}, function(error) {
			assert.ok(error);
			assert.ok(error instanceof errors.ValidationError);
			assert.equal(error.type, 'ValidationError');
			assert.deepEqual(error.data, {
				name: ['Name can not be empty']
			});
		});
	});

	it('.update', function () {
		var ValidationService = Proto.extend({
			validate: function(data, params, cb) {
				assert.equal(params.validates, 'update');
				if(!data.name || data.name === '') {
					return cb({
						name: ['Name can not be empty']
					});
				}
				return cb();
			},

			update: function(id, data, params, cb) {
				cb(null, {
					id: id,
					name: data.name
				});
			}
		});

		mixinValidation(ValidationService);

		var instance = Proto.create.call(ValidationService);
		instance.update(14, { name: 'Tester' }, {}, function(error, data) {
			assert.ok(!error);
			assert.equal(data.id, 14);
		});

		instance.update('14', { fullName: 'Tester' }, {}, function(error) {
			assert.ok(error);
			assert.ok(error instanceof errors.ValidationError);
			assert.equal(error.type, 'ValidationError');
			assert.deepEqual(error.data, {
				name: ['Name can not be empty']
			});
		});
	});
});
