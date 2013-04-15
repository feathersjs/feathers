function createError(name) {
	function Err(message, data) {
		this.name = name;
		this.message = message || "Unknown error";
		this.data = data;
	}

	Err.prototype = Object.create(Error);

	return Err;
}

[ 'MethodNotAllowed', 'NotFound' ].forEach(function (name) {
	exports[name] = createError(name);
});
