var feathry = require('../lib/feathry'), Feathry = feathry.Feathry, Registry = feathry.Registry;

exports.Registry = function (test) {
	test.expect(4);
	var instance = new Registry();
	instance.register('my/resource', {
		init : function()
		{
			test.ok("Init called");
		},
		
		method : function()
		{
			return 'Got it';
		}
	});
	test.deepEqual(instance.names(), [ 'my/resource' ]);
	test.equals(instance.resource('my/resource').method(), 'Got it');
	var dispatcher = instance.dispatcher('my/resource', 'method');
	test.equals(dispatcher(), 'Got it');
	test.done();
};

exports.Handler = function (test) {
	test.expect(2);
	var dummy = function(registry) {
		test.deepEqual(registry.names(), [ 'my/resource' ]);
		test.ok("Ran dummy handler");
	};
	new Feathry().handles(dummy).resource('my/resource', {
		method : function()
		{
			return "Got it";
		}
	}).start();
	test.done();
};
