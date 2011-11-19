var feathry = require('../lib/feathry'), 

users = [{
		id : 1,
		username : 'tester'
	}, {
		id : 2,
		username : 'tester',
		firstname : 'John',
		lastname : 'Doe'
	}],
	
myresource = {
	index : function(cb, params) {
		cb(null, users);
	},
	
	get : function(cb, id, params) {
		for(var i = 0; i < users.length; i++) {
			if(users[i].id == id) {
				cb(null, users[i]);
				return;
			}
		}
		cb('Could not find user ' + id);
	},
	
	create : function(cb, data, params)
	{
		users.push(data);
		cb(null, data);
	},
	
	update : function(cb, id, data, params)
	{
		
	},
	
	destroy : function(cb, id, params)
	{
		
	}
};

feathry.handles(feathry.rest()).resource('test', myresource).start();
