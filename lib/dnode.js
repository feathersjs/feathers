var dnode = require('dnode');

exports = function(config) {
	config = config || {};
	return function(registry)
	{
		dnode(registry.resources).listen(config.port || 5050);
	};
}