var feathers = require('../../lib/feathers');

var users = [
	{
		id: '1',
		name: 'Wayne Campbell',
		slogan: 'Party on Garth'
	},
	{
		id: '2',
		name: 'Garth Algar',
		slogan: 'Party on Wayne'
	}
];

var app = feathers().use('users', {
	find: function (params, cb) {
		cb(null, users);
	},

	get: function (id, params, cb) {
		for (var user in users) {
			if (users[user] && users[user].id == id) {
				return cb(null, users[user]);
			}
		}

		cb(new Error('User With ID ' + id + ' Not Found'));
	}
}).listen(3000);
