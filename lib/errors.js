function createError(name, defaultMessage) {
	function Err(message, data, statusCode) {
		this.name = this.type = name;
		this.message = message || defaultMessage || "Internal Server Error";
		this.data = data;
		this.status = statusCode || 500;
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
	this.status = 400;
};

ValidationError.prototype = Object.create(Error);
