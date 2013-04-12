var Proto = require('uberproto');
var uId = 0;

module.exports = Proto.extend({
	init: function (idField) {
		this._id = idField;
		this.store = {};
	},

	index: function (cb, params) {
		var store = this.store,
			result = Object.keys(store).map(function (value) {
				return store[value];
			});
		cb(null, result);
	},

	get: function (cb, id, params) {
		if (id in this.store) {
			cb(null, this.store[id]);
			return;
		}
		cb('Could not find record with ' + id);
	},

	create: function (cb, data, params) {
		var id = data[this._id] || uId++;
		data[this._id] = id;
		this.store[id] = data;
		cb(null, data);
	},

	update: function (cb, id, data, params) {
		if (id in this.store) {
			this.store[id] = data;
			cb(null, store[id]);
			return;
		}
		cb('Could not find record with ' + id);
	},

	destroy: function (cb, id, params) {
		if (id in this.store) {
			var deleted = this.store[id];
			delete this.store[id];
			return cb(null, deleted);
		}
		cb('Could not find record with ' + id);
	}
});
