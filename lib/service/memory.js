var Proto = require('uberproto');
var error = require('../errors');
var _ = require('underscore');
var mutators = {
	__sort: function (values, param) {
		return _.sortBy(values, function (item) {
			return item[param];
		});
	},
	__order: function (values) {
		return values.reverse();
	},
	__offset: function (values, param) {
		return values.slice(param);
	},
	__limit: function (values, param) {
		return values.slice(0, param);
	}
}

module.exports = Proto.extend({
	init: function (idField) {
		this._id = idField || 'id';
		this._uId = 0;
		this.store = {};
	},

	index: function (params, cb) {
		var values = _.values(this.store);

		_.each(mutators, function(handler, name) {
			values = params[name] ? handler(values, params[name]) : values;
		});

		cb(null, values);
	},

	get: function (id, params, cb) {
		if (id in this.store) {
			cb(null, this.store[id]);
			return;
		}
		cb(new error.NotFound('Could not find record', { id: id }));
	},

	create: function (data, params, cb) {
		var id = data[this._id] || this._uId++;
		data[this._id] = id;
		this.store[id] = data;
		cb(null, data);
	},

	update: function (id, data, cb) {
		if (id in this.store) {
			this.store[id] = data;
			cb(null, store[id]);
			return;
		}
		cb('Could not find record with ' + id);
	},

	destroy: function (id, params, cb) {
		if (id in this.store) {
			var deleted = this.store[id];
			delete this.store[id];
			return cb(null, deleted);
		}
		cb('Could not find record with ' + id);
	}
});
