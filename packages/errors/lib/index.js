'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.types = exports.errors = undefined;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var debug = (0, _debug2.default)('feathers-errors');

// NOTE (EK): Babel doesn't properly support extending
// some classes in ES6. The Error class being one of them.
// Node v5.0+ does support this but until we want to drop support
// for older versions we need this hack.
// http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
function AbstractError(klass) {
  function Constructor(msg, name, code, className, data) {
    msg = msg || 'Error';

    var errors = undefined;
    var message = undefined;

    if (msg instanceof Error) {
      message = msg.message || 'Error';

      // NOTE (EK): This is typically to handle validation errors
      if (msg.errors) {
        errors = msg.errors;
      }
    }
    // Support plain old objects
    else if ((typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object') {
        message = msg.message || 'Error';
        data = msg;
      }
      // message is just a string
      else {
          message = msg;
        }

    klass.call(this, msg);

    if (data && data.errors) {
      errors = data.errors;
      delete data.errors;
    }

    // NOTE (EK): Babel doesn't support this so
    // we have to pass in the class name manually.
    // this.name = this.constructor.name;
    this.name = name;
    this.message = message;
    this.code = code;
    this.className = className;
    this.data = data;
    this.errors = errors || {};

    Error.captureStackTrace(this, this.name);

    debug(this.name + '(' + this.code + '): ' + this.message);
  }

  AbstractError.prototype = Object.create(klass.prototype);
  Object.setPrototypeOf(AbstractError, klass);

  return Constructor;
}

var BadRequest = (function (_AbstractError) {
  _inherits(BadRequest, _AbstractError);

  function BadRequest(message, data) {
    _classCallCheck(this, BadRequest);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BadRequest).call(this, message, 'BadRequest', 400, 'bad-request', data));
  }

  return BadRequest;
})(AbstractError(Error));

var NotAuthenticated = (function (_AbstractError2) {
  _inherits(NotAuthenticated, _AbstractError2);

  function NotAuthenticated(message, data) {
    _classCallCheck(this, NotAuthenticated);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotAuthenticated).call(this, message, 'NotAuthenticated', 401, 'not-authenticated', data));
  }

  return NotAuthenticated;
})(AbstractError(Error));

var PaymentError = (function (_AbstractError3) {
  _inherits(PaymentError, _AbstractError3);

  function PaymentError(message, data) {
    _classCallCheck(this, PaymentError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PaymentError).call(this, message, 'PaymentError', 402, 'payment-error', data));
  }

  return PaymentError;
})(AbstractError(Error));

var Forbidden = (function (_AbstractError4) {
  _inherits(Forbidden, _AbstractError4);

  function Forbidden(message, data) {
    _classCallCheck(this, Forbidden);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Forbidden).call(this, message, 'Forbidden', 403, 'forbidden', data));
  }

  return Forbidden;
})(AbstractError(Error));

var NotFound = (function (_AbstractError5) {
  _inherits(NotFound, _AbstractError5);

  function NotFound(message, data) {
    _classCallCheck(this, NotFound);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotFound).call(this, message, 'NotFound', 404, 'not-found', data));
  }

  return NotFound;
})(AbstractError(Error));

var MethodNotAllowed = (function (_AbstractError6) {
  _inherits(MethodNotAllowed, _AbstractError6);

  function MethodNotAllowed(message, data) {
    _classCallCheck(this, MethodNotAllowed);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MethodNotAllowed).call(this, message, 'MethodNotAllowed', 405, 'method-not-allowed', data));
  }

  return MethodNotAllowed;
})(AbstractError(Error));

var NotAcceptable = (function (_AbstractError7) {
  _inherits(NotAcceptable, _AbstractError7);

  function NotAcceptable(message, data) {
    _classCallCheck(this, NotAcceptable);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotAcceptable).call(this, message, 'NotAcceptable', 406, 'not-acceptable', data));
  }

  return NotAcceptable;
})(AbstractError(Error));

var Timeout = (function (_AbstractError8) {
  _inherits(Timeout, _AbstractError8);

  function Timeout(message, data) {
    _classCallCheck(this, Timeout);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Timeout).call(this, message, 'Timeout', 408, 'timeout', data));
  }

  return Timeout;
})(AbstractError(Error));

var Conflict = (function (_AbstractError9) {
  _inherits(Conflict, _AbstractError9);

  function Conflict(message, data) {
    _classCallCheck(this, Conflict);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Conflict).call(this, message, 'Conflict', 409, 'conflict', data));
  }

  return Conflict;
})(AbstractError(Error));

var Unprocessable = (function (_AbstractError10) {
  _inherits(Unprocessable, _AbstractError10);

  function Unprocessable(message, data) {
    _classCallCheck(this, Unprocessable);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Unprocessable).call(this, message, 'Unprocessable', 422, 'unprocessable', data));
  }

  return Unprocessable;
})(AbstractError(Error));

var GeneralError = (function (_AbstractError11) {
  _inherits(GeneralError, _AbstractError11);

  function GeneralError(message, data) {
    _classCallCheck(this, GeneralError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(GeneralError).call(this, message, 'GeneralError', 500, 'general-error', data));
  }

  return GeneralError;
})(AbstractError(Error));

var NotImplemented = (function (_AbstractError12) {
  _inherits(NotImplemented, _AbstractError12);

  function NotImplemented(message, data) {
    _classCallCheck(this, NotImplemented);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotImplemented).call(this, message, 'NotImplemented', 501, 'not-implemented', data));
  }

  return NotImplemented;
})(AbstractError(Error));

var Unavailable = (function (_AbstractError13) {
  _inherits(Unavailable, _AbstractError13);

  function Unavailable(message, data) {
    _classCallCheck(this, Unavailable);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Unavailable).call(this, message, 'Unavailable', 503, 'unavailable', data));
  }

  return Unavailable;
})(AbstractError(Error));

var errors = {
  BadRequest: BadRequest,
  NotAuthenticated: NotAuthenticated,
  PaymentError: PaymentError,
  Forbidden: Forbidden,
  NotFound: NotFound,
  MethodNotAllowed: MethodNotAllowed,
  NotAcceptable: NotAcceptable,
  Timeout: Timeout,
  Conflict: Conflict,
  Unprocessable: Unprocessable,
  GeneralError: GeneralError,
  NotImplemented: NotImplemented,
  Unavailable: Unavailable
};

var types = errors;

exports.default = errors;
exports.errors = errors;
exports.types = types;