var feathry = require('./../lib/feathry');

feathry.createServer({
	port: 8000
}).service('testing', {
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
	get : function(id, params, cb) {
		cb(null, {
			id: id,
			name : 'hi'
		})
	}
}).use(feathry.rest()).use(feathry.socketio()).start();