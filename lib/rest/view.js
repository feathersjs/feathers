
exports.view = {
	'application/json' : function(data, stream, params) {
		next(JSON.stringify(data));
	}
}

var view = function(data, req, res) {

};

var http = require('http'), mime = require('mime');

/**
 * Request prototype.
 */
var req = exports = module.exports = {
	__proto__ : http.IncomingMessage.prototype
};

/**
 * RFC compliant content negotation.
 *
 * @param {String} types The content type or
 * an array of types.
 * @return The best matching type or false if
 * not type has been found.
 */
req.negotiate = function(types) {
	var accept = this.headers['Accept'], type = String(type);

	// when not present or "*/*" accept anything
	if(!accept || '*/*' == accept)
		return true;

	// normalize extensions ".json" -> "json"
	if('.' == type[0])
		type = type.substr(1);

	// allow "html" vs "text/html" etc
	if(!~type.indexOf('/'))
		type = mime.lookup(type);

	// check if we have a direct match
	if(~accept.indexOf(type))
		return true;

	// check if we have type/*
	type = type.split('/')[0] + '/*';
	return !!~accept.indexOf(type);
};

