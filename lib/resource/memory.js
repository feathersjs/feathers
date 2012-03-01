module.exports = function (options)
{
	var store = {}, uId = 0, idKey = (typeof options != 'undefined' && options.id) || 'id';
	return {
		index : function (cb, params)
		{
			var result = [];
			for (var key in store) {
				result.push(store[key]);
			}
			cb(null, result);
		},

		get : function (cb, id, params)
		{
			if (id in store) {
				cb(null, store[id]);
				return;
			}
			cb('Could not find record with ' + id);
		},

		create : function (cb, data, params)
		{
			var id = data[idKey] || uId++;
			data[idKey] = id;
			store[id] = data;
			cb(null, data);
		},

		update : function (cb, id, data, params)
		{
			if (id in store) {
				store[id] = data;
				cb(null, store[id]);
				return;
			}
			cb('Could not find record with ' + id);
		},

		destroy : function (cb, id, params)
		{
			if (id in store) {
				cb(null, store[id])
				delete store;
				return;
			}
			cb('Could not find record with ' + id);
		}
	};
};