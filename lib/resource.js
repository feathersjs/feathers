var Class = require('uberclass');

exports.Memory = Class.extend({
	store : {},
	id : 0
}, {
	index : function(cb, params) {
		var result = [];
		for(var key in this.Class.store) {
			result.push(this.Class.store[key]);
		}
		cb(null, result);
	},
	
	get : function(cb, id, params) {
		if(id in this.Class.store) {
			cb(null, this.Class.store[id]);
			return;
		}
		cb('Could not find record with ' + id);
	},
	
	create : function(cb, data, params)
	{
		var id = data.id || this.Class.id++;
		this.Class.store[id] = data;
		cb(null, data);
	},
	
	update : function(cb, id, data, params)
	{
		if(id in this.Class.store) {
			this.Class.store[id] = data;
			cb(null, this.Class.store[id]);
			return;
		}
		cb('Could not find record with ' + id);
	},
	
	destroy : function(cb, id, params)
	{
		if(id in this.Class.store) {
			cb(null, this.Class.store[id])
			delete this.Class.store;
			return;
		}
		cb('Could not find record with ' + id);
	}
});
