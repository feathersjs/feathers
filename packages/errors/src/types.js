var util = require('util');

// Abstract Error
var AbstractError = exports.AbstractError = function(msg, constr, data) {
  Error.captureStackTrace(this, constr || this);

  if (msg instanceof Error) {
    this.message = msg.message;

    if (msg.errors) {
      this.errors = msg.errors;
    }
  }
  else {
    this.message = msg || 'Error';
  }
  
  this.data = data;
};

util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

function createError(errorName, code, className) {
  var errorFn = exports[errorName] = function(msg, data) {
    errorFn.super_.call(this, msg, this.constructor, data);
  };

  util.inherits(errorFn, AbstractError);

  errorFn.prototype.name = errorName;
  errorFn.prototype.code = code;
  errorFn.prototype.className = className;
}

createError('BadRequest', 400, 'bad-request');
createError('NotAuthenticated', 401, 'not-authenticated');
createError('PaymentError', 402, 'payment-error');
createError('Forbidden', 403, 'forbidden');
createError('NotFound', 404, 'not-found');
createError('MethodNotAllowed', 405, 'method-not-allowed');
createError('NotAcceptable', 406, 'not-acceptable');
createError('Timeout', 408, 'timeout');
createError('Conflict', 409, 'conflict');
createError('Unprocessable', 422, 'unprocessable');
createError('GeneralError', 500, 'error');
createError('NotImplemented', 501, 'not-implemented');
createError('Unavailable', 503, 'unavailable');