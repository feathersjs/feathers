var feathry = require('./../lib/feathry');

feathry.createServer().service('testing', {
	index : function (cb, params) {
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
	get : function(cb, id, params) {
		cb(null, {
			name : 'hi ' + id
		})
	}
}).use(feathry.rest({
	port: 3000
})).start();