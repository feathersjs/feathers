var util = require('util');

// Abstract Error
var AbstractError = exports.AbstractError = function(msg, constr, data) {
  Error.captureStackTrace(this, constr || this);
  this.message = msg instanceof Error ? msg.message : (msg || 'Error');
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

createError('GeneralError', 500, 'error');
createError('BadRequest', 400, 'bad-request');
createError('NotAuthenticated', 401, 'not-authenticated');
createError('Forbidden', 403, 'forbidden');
createError('NotFound', 404, 'not-found');
createError('Timeout', 409, 'timeout');
createError('Conflict', 409, 'conflict');
createError('PaymentError', 409, 'payment-error');
createError('Unprocessable', 422, 'unprocessable');