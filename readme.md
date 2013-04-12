# Feathry

A resource oriented service dispatcher for NodeJS.

## What is a service?

A service can be pretty much any JavaScript object offering service methods.
To work with Nodes event mechanism a service method has to take a callback
as the first parameter and should be called with the results.

If you want to make your service accessible via REST you have to provide at
least one of the methods following the resource-service patttern:

	{
		index : function(cb, params) {
		},
		
		get : function(cb, id, params) {
		},
		
		create : function(cb, data, params)
		{
		},
		
		update : function(cb, id, data, params)
		{
		},
		
		destroy : function(cb, id, params)
		{
		}
	}


## Creating resources

var app = require('cool-name');

app.register('users', {
    index : function(cb, params) {
    	cb(null, [{
    		id: 0,
    		name: 'Duck'
    	}])
    },

    get : function(cb, id, params) {
    },

    create : function(cb, data, params)
    {
    },

    update : function(cb, id, data, params)
    {
    },

    destroy : function(cb, id, params)
    {
    }
});

### Handlers

var rest = require('cool-name/handler/rest');
var zeromq = require('cool-name/handler/zeromq');

app.use(rest, {
	port: 8080,
	baseUrl: 'myname.com'
}).use(zeromq, {
	port: 7887
});

app.start();
// REST http://myname.com:8080/users
// ZEROMQ zmq://myname.com:7887/users

## Finding resources

// Mapping configuration file
{
	"users": "http://myname.com:8080/user",
	"comments": {
		"protocol": "zmq",
		"host" : "myname.com",
		"port": 7887,
		"name": "comments"
	}
}

// post.js
var Comment = Registry.lookup('comments');

## Associations

{
	"username": "Eric",
	"comments": [
		"http://node-1.com/comments/10",
		"http://node-1.com/comments/11"
	]
}


var User = Resource.define({
	"username": String,
	"comments": [Resource.lookup('http://localhost/users')]
})



Resource.lookup('http://localhost/users');