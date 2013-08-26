var assert = require('assert');

var findAllData = [{
	id: 0,
	description: 'You have to do something'
}, {
	id: 1,
	description: 'You have to do laundry'
}];

exports.Service = {
	find: function(params, callback) {
		callback(null, findAllData);
	},

	get: function(name, params, callback) {
		callback(null, {
			id: name,
			description: "You have to do " + name + "!"
		});
	},

	create: function(data, params, callback) {
		var result = _.clone(data);
		result.id = 2;
		callback(null, result);
	}
}

exports.assert = {
	find: function(data) {
		assert.deepEqual(findAllData, data, 'Data as expected');
	},

	get: function(id, data) {
		assert.equal(data.id, id, 'Got id in data');
		assert.equal(data.description, 'You have to do ' + id + '!', 'Got description');
	}
}
