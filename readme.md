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
