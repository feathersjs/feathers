var mongoose = require('mongoose'), Proto = require('uberproto');

var Service = exports.Service = Proto.extend({
	init : function(Model)
	{
		this.Model = Model;
	},

	index : function (cb, params)
	{
		this.Model.find(params, function (err, docs)
		{
			if (err) {
				return cb(err);
			}
			return cb(null, docs.map(function (doc)
			{
				return doc.toObject();
			}));
		});
	},

	get : function (cb, id, params)
	{
		this.Model.findById(id, function (err, doc)
		{
			if (err) {
				return cb(err);
			}
			return cb(null, doc.toObject());
		});
	},

	create : function (cb, data, params)
	{
		var model = new this.Model(data);
		model.save(function (err)
		{
			if(err) {
				return cb(err);
			}
			cb(null, model.toObject());
		});
	},

	update : function (cb, id, data, params)
	{

	},

	destroy : function (cb, id, params)
	{

	}
});

exports.resource = function (name, schema)
{
	var Model = mongoose.model(name, schema);
	return Service.create(Model);
};