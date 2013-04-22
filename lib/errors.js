function createError(name, defaultMessage) {
	function Err(message, data) {
		this.name = this.type = name;
		this.message = message || defaultMessage || "Unknown error";
		this.data = data;
	}

	Err.prototype = Object.create(Error);

	return Err;
}

[ 'MethodNotAllowed', 'NotFound', 'UnsupportedMediaType' ].forEach(function (name) {
	exports[name] = createError(name);
});

var ValidationError = exports.ValidationError = function Err(message, data) {
	if(typeof message !== 'string' && !data) {
		data = message;
		message = 'Validation failed!';
	}

	this.name = this.type = 'ValidationError';
	this.message = message;
	this.data = data;
}

ValidationError.prototype = Object.create(Error);
