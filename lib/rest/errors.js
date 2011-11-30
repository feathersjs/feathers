function NotAcceptable(msg, accepts) {
	this.name = 'NotAcceptable';
	this.code = 406;
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
};
NotAcceptable.prototype.__proto__ = Error.prototype;

function BadRequest(msg) {
	this.name = 'BadRequest';
	this.code = 400;
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
};
BadRequest.prototype.__proto__ = Error.prototype;

function UnsupportedMediaType(msg, accepting) {
	this.name = 'UnsupportedMediaType';
	this.code = 415;
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
};
UnsupportedMediaType.prototype.__proto__ = Error.prototype;
