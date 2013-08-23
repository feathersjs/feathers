var Proto = require('uberproto');
var _ = require('underscore');

var services = {
  memory: require('./memory'),
  mongodb: require('./mongodb')
};

exports = module.exports = {};
_.each(services, function(Service, name) {
	exports[name] = function(options) {
		return Proto.create.call(Service, options);
	};

	exports[name].Service = Service;
});
