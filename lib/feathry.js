var Class = require('uberclass'), Rest = require('./rest/handler');

/**
 * The central resource registry.
 */
var Registry = exports.Registry = Class.extend({	
	/**
	 * Register a new resource.
	 * 
	 * @param {String} name The name to use
	 * @param {Object} resource The methods to register 
	 */
	register : function(name, resource)
	{
		this[name] = resource;
	},
	
	/**
	 * Loop through all resources executing a given callback with the
	 * name and the instance passed as the parameter.
	 */	
	forEach : function(cb)
	{
		for(var name in this) {
			if(this.hasOwnProperty(name) && (typeof this[name] != 'function')) { 
				if(cb(name, this[name]) === false) {
					break;
				}
			}
		}
	}
});

var Feathry = exports.Feathry = Class.extend({}, {
	init : function()
	{
		this._registry = new Registry();
		this._handlers = [];
	},
	
	/**
	 * Add a handler. A handler callback gets a registry object
	 * passed as a parameter.
	 */
	handles : function(handler)
	{
		this._handlers.push(handler);
		return this;
	},
	
	/**
	 * Start all handlers
	 */
	start : function()
	{
		var registry = this._registry;
		this._handlers.forEach(function(handler, index) {
			handler(registry);
		});
	},
	
	/*
	 * Register a new resource with a given name.
	 */
	resource : function(name, instance)
	{
		this._registry.register(name, instance);
		return this;
	}
});

var server = new Feathry();
exports.handles = server.callback('handles');
exports.rest = Rest.handler;
