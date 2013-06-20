var feathers = require('./../lib/feathers');
var Proto = require('uberproto');
var service = {
	index : function (params, cb) {
		cb(null, [
			{
				test : 'hi',
				params : params
			},
			{
				test : 'there'
			}
		]);
	},

	create: function(data, params, cb) {
		cb(null, data);
	},

	get : function(id, params, cb) {
		cb(null, {
			id: id,
			name : 'hi'
		})
	}
};

Proto.mixin(require('../lib/mixins/event'), service);

feathers.createServer({ port: 8000 })
	.service('testing', service)
	.provide(feathers.rest())
	.provide(feathers.socketio())
	.start();
