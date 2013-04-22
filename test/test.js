var feathry = require('./../lib/feathry');
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

Proto.mixin(require('../lib/mixin/event'), service);

feathry.createServer({ port: 8000 })
	.service('testing', service)
	.provide(feathry.rest())
	.provide(feathry.socketio())
	.start();
