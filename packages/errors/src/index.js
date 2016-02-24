const debug = require('debug')('feathers-errors');

// NOTE (EK): Babel doesn't properly support extending
// some classes in ES6. The Error class being one of them.
// Node v5.0+ does support this but until we want to drop support
// for older versions we need this hack.
// http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
// https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend

class FeathersError extends Error {
  constructor(msg, name, code, className, data) {
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
    }
    // Support plain old objects
    else if (typeof msg === 'object') {
      message = msg.message || 'Error';
      data = msg;
    }
    // message is just a string
    else {
      message = msg;
    }

    if (data) {
      // NOTE(EK): To make sure that we are not messing
      // with immutable data, just make a copy.
      // https://github.com/feathersjs/feathers-errors/issues/19
      newData = Object.assign({}, data);

      if (newData.errors) {
        errors = newData.errors;
        delete newData.errors;
      }
    }

    super(message);

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
  }

  // NOTE (EK): A little hack to get around `message` not
  // being included in the default toJSON call.
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      className: this.className,
      data: this.data,
      errors: this.errors
    };
  }
}

class BadRequest extends FeathersError {
  constructor(message, data) {
    super(message, 'BadRequest', 400, 'bad-request', data);
  }
}

class NotAuthenticated extends FeathersError {
  constructor(message, data) {
    super(message, 'NotAuthenticated', 401, 'not-authenticated', data);
  }
}

class PaymentError extends FeathersError {
  constructor(message, data) {
    super(message, 'PaymentError', 402, 'payment-error', data);
  }
}

class Forbidden extends FeathersError {
  constructor(message, data) {
    super(message, 'Forbidden', 403, 'forbidden', data);
  }
}

class NotFound extends FeathersError {
  constructor(message, data) {
    super(message, 'NotFound', 404, 'not-found', data);
  }
}

class MethodNotAllowed extends FeathersError {
  constructor(message, data) {
    super(message, 'MethodNotAllowed', 405, 'method-not-allowed', data);
  }
}

class NotAcceptable extends FeathersError {
  constructor(message, data) {
    super(message, 'NotAcceptable', 406, 'not-acceptable', data);
  }
}

class Timeout extends FeathersError {
  constructor(message, data) {
    super(message, 'Timeout', 408, 'timeout', data);
  }
}

class Conflict extends FeathersError {
  constructor(message, data) {
    super(message, 'Conflict', 409, 'conflict', data);
  }
}

class Unprocessable extends FeathersError {
  constructor(message, data) {
    super(message, 'Unprocessable', 422, 'unprocessable', data);
  }
}

class GeneralError extends FeathersError {
  constructor(message, data) {
    super(message, 'GeneralError', 500, 'general-error', data);
  }
}

class NotImplemented extends FeathersError {
  constructor(message, data) {
    super(message, 'NotImplemented', 501, 'not-implemented', data);
  }
}

class Unavailable extends FeathersError {
  constructor(message, data) {
    super(message, 'Unavailable', 503, 'unavailable', data);
  }
}

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
  Unprocessable,
  GeneralError,
  NotImplemented,
  Unavailable
};

export default Object.assign({ types: errors, errors }, errors);
