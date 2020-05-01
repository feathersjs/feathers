const debug = require('debug')('@feathersjs/errors');

function FeathersError (msg, name, code, className, data) {
  msg = msg || 'Error';

  let errors;
  let message;
  let newData;

  if (msg instanceof Error) {
    message = msg.message || 'Error';

    // NOTE (EK): This is typically to handle validation errors
    if (msg.errors) {
      errors = msg.errors;
    }
  } else if (typeof msg === 'object') { // Support plain old objects
    message = msg.message || 'Error';
    data = msg;
  } else { // message is just a string
    message = msg;
  }

  if (data) {
    // NOTE(EK): To make sure that we are not messing
    // with immutable data, just make a copy.
    // https://github.com/feathersjs/errors/issues/19
    newData = JSON.parse(JSON.stringify(data));

    if (newData.errors) {
      errors = newData.errors;
      delete newData.errors;
    } else if (data.errors) {
      // The errors property from data could be
      // stripped away while cloning resulting newData not to have it
      // For example: when cloning arrays this property
      errors = JSON.parse(JSON.stringify(data.errors));
    }
  }

  // NOTE (EK): Babel doesn't support this so
  // we have to pass in the class name manually.
  // this.name = this.constructor.name;
  this.type = 'FeathersError';
  this.name = name;
  this.message = message;
  this.code = code;
  this.className = className;
  this.data = newData;
  this.errors = errors || {};

  debug(`${this.name}(${this.code}): ${this.message}`);
  debug(this.errors);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, FeathersError);
  } else {
    this.stack = (new Error()).stack;
  }
}

function inheritsFrom (Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}

inheritsFrom(FeathersError, Error);

// NOTE (EK): A little hack to get around `message` not
// being included in the default toJSON call.
Object.defineProperty(FeathersError.prototype, 'toJSON', {
  value: function () {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      className: this.className,
      data: this.data,
      errors: this.errors
    };
  }
});

// 400 - Bad Request
function BadRequest (message, data) {
  FeathersError.call(this, message, 'BadRequest', 400, 'bad-request', data);
}

inheritsFrom(BadRequest, FeathersError);

// 401 - Not Authenticated
function NotAuthenticated (message, data) {
  FeathersError.call(this, message, 'NotAuthenticated', 401, 'not-authenticated', data);
}

inheritsFrom(NotAuthenticated, FeathersError);

// 402 - Payment Error
function PaymentError (message, data) {
  FeathersError.call(this, message, 'PaymentError', 402, 'payment-error', data);
}

inheritsFrom(PaymentError, FeathersError);

// 403 - Forbidden
function Forbidden (message, data) {
  FeathersError.call(this, message, 'Forbidden', 403, 'forbidden', data);
}

inheritsFrom(Forbidden, FeathersError);

// 404 - Not Found
function NotFound (message, data) {
  FeathersError.call(this, message, 'NotFound', 404, 'not-found', data);
}

inheritsFrom(NotFound, FeathersError);

// 405 - Method Not Allowed
function MethodNotAllowed (message, data) {
  FeathersError.call(this, message, 'MethodNotAllowed', 405, 'method-not-allowed', data);
}

inheritsFrom(MethodNotAllowed, FeathersError);

// 406 - Not Acceptable
function NotAcceptable (message, data) {
  FeathersError.call(this, message, 'NotAcceptable', 406, 'not-acceptable', data);
}

inheritsFrom(NotAcceptable, FeathersError);

// 408 - Timeout
function Timeout (message, data) {
  FeathersError.call(this, message, 'Timeout', 408, 'timeout', data);
}

inheritsFrom(Timeout, FeathersError);

// 409 - Conflict
function Conflict (message, data) {
  FeathersError.call(this, message, 'Conflict', 409, 'conflict', data);
}

inheritsFrom(Conflict, FeathersError);

// 410 - Gone
function Gone (message, data) {
  FeathersError(this, message, 'Gone', 410, 'gone', data);
}

inheritsFrom(Gone, FeathersError);

// 411 - Length Required
function LengthRequired (message, data) {
  FeathersError.call(this, message, 'LengthRequired', 411, 'length-required', data);
}

inheritsFrom(LengthRequired, FeathersError);

// 422 Unprocessable
function Unprocessable (message, data) {
  FeathersError.call(this, message, 'Unprocessable', 422, 'unprocessable', data);
}

inheritsFrom(Unprocessable, FeathersError);

// 429 Too Many Requests
function TooManyRequests (message, data) {
  FeathersError.call(this, message, 'TooManyRequests', 429, 'too-many-requests', data);
}

inheritsFrom(TooManyRequests, FeathersError);

// 500 - General Error
function GeneralError (message, data) {
  FeathersError.call(this, message, 'GeneralError', 500, 'general-error', data);
}

inheritsFrom(GeneralError, FeathersError);

// 501 - Not Implemented
function NotImplemented (message, data) {
  FeathersError.call(this, message, 'NotImplemented', 501, 'not-implemented', data);
}

inheritsFrom(NotImplemented, FeathersError);

// 502 - Bad Gateway
function BadGateway (message, data) {
  FeathersError.call(this, message, 'BadGateway', 502, 'bad-gateway', data);
}

inheritsFrom(BadGateway, FeathersError);

// 503 - Unavailable
function Unavailable (message, data) {
  FeathersError.call(this, message, 'Unavailable', 503, 'unavailable', data);
}

inheritsFrom(Unavailable, FeathersError);

const errors = {
  FeathersError,
  BadRequest,
  NotAuthenticated,
  PaymentError,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  Timeout,
  Conflict,
  Gone,
  LengthRequired,
  Unprocessable,
  TooManyRequests,
  GeneralError,
  NotImplemented,
  BadGateway,
  Unavailable,
  400: BadRequest,
  401: NotAuthenticated,
  402: PaymentError,
  403: Forbidden,
  404: NotFound,
  405: MethodNotAllowed,
  406: NotAcceptable,
  408: Timeout,
  409: Conflict,
  410: Gone,
  411: LengthRequired,
  422: Unprocessable,
  429: TooManyRequests,
  500: GeneralError,
  501: NotImplemented,
  502: BadGateway,
  503: Unavailable
};

function convert (error) {
  if (!error) {
    return error;
  }

  const FeathersError = errors[error.name];
  const result = FeathersError
    ? new FeathersError(error.message, error.data)
    : new Error(error.message || error);

  if (typeof error === 'object') {
    Object.assign(result, error);
  }

  return result;
}

module.exports = Object.assign({ convert }, errors);
