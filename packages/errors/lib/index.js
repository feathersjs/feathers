'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.types = exports.errors = undefined;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

var debug = (0, _debug2.default)('feathers-errors');

// NOTE (EK): Babel doesn't properly support extending
// some classes in ES6. The Error class being one of them.
// Node v5.0+ does support this but until we want to drop support
// for older versions we need this hack.
// http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
// https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend

var FeathersError = (function (_extendableBuiltin2) {
  _inherits(FeathersError, _extendableBuiltin2);

  function FeathersError(msg, name, code, className, data) {
    _classCallCheck(this, FeathersError);

    msg = msg || 'Error';

    var errors = undefined;
    var message = undefined;
    var newData = undefined;

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

    if (data) {
      // NOTE(EK): To make sure that we are not messing
      // with immutable data, just make a copy.
      // https://github.com/feathersjs/feathers-errors/issues/19
      newData = _extends({}, data);

      if (newData.errors) {
        errors = newData.errors;
        delete newData.errors;
      }
    }

    // NOTE (EK): Babel doesn't support this so
    // we have to pass in the class name manually.
    // this.name = this.constructor.name;

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FeathersError).call(this, message));

    _this.name = name;
    _this.message = message;
    _this.code = code;
    _this.className = className;
    _this.data = newData;
    _this.errors = errors || {};

    debug(_this.name + '(' + _this.code + '): ' + _this.message);
    return _this;
  }

  // NOTE (EK): A little hack to get around `message` not
  // being included in the default toJSON call.

  _createClass(FeathersError, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        name: this.name,
        message: this.message,
        code: this.code,
        className: this.className,
        data: this.data,
        errors: this.errors
      };
    }
  }]);

  return FeathersError;
})(_extendableBuiltin(Error));

var BadRequest = (function (_FeathersError) {
  _inherits(BadRequest, _FeathersError);

  function BadRequest(message, data) {
    _classCallCheck(this, BadRequest);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BadRequest).call(this, message, 'BadRequest', 400, 'bad-request', data));
  }

  return BadRequest;
})(FeathersError);

var NotAuthenticated = (function (_FeathersError2) {
  _inherits(NotAuthenticated, _FeathersError2);

  function NotAuthenticated(message, data) {
    _classCallCheck(this, NotAuthenticated);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotAuthenticated).call(this, message, 'NotAuthenticated', 401, 'not-authenticated', data));
  }

  return NotAuthenticated;
})(FeathersError);

var PaymentError = (function (_FeathersError3) {
  _inherits(PaymentError, _FeathersError3);

  function PaymentError(message, data) {
    _classCallCheck(this, PaymentError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PaymentError).call(this, message, 'PaymentError', 402, 'payment-error', data));
  }

  return PaymentError;
})(FeathersError);

var Forbidden = (function (_FeathersError4) {
  _inherits(Forbidden, _FeathersError4);

  function Forbidden(message, data) {
    _classCallCheck(this, Forbidden);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Forbidden).call(this, message, 'Forbidden', 403, 'forbidden', data));
  }

  return Forbidden;
})(FeathersError);

var NotFound = (function (_FeathersError5) {
  _inherits(NotFound, _FeathersError5);

  function NotFound(message, data) {
    _classCallCheck(this, NotFound);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotFound).call(this, message, 'NotFound', 404, 'not-found', data));
  }

  return NotFound;
})(FeathersError);

var MethodNotAllowed = (function (_FeathersError6) {
  _inherits(MethodNotAllowed, _FeathersError6);

  function MethodNotAllowed(message, data) {
    _classCallCheck(this, MethodNotAllowed);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MethodNotAllowed).call(this, message, 'MethodNotAllowed', 405, 'method-not-allowed', data));
  }

  return MethodNotAllowed;
})(FeathersError);

var NotAcceptable = (function (_FeathersError7) {
  _inherits(NotAcceptable, _FeathersError7);

  function NotAcceptable(message, data) {
    _classCallCheck(this, NotAcceptable);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotAcceptable).call(this, message, 'NotAcceptable', 406, 'not-acceptable', data));
  }

  return NotAcceptable;
})(FeathersError);

var Timeout = (function (_FeathersError8) {
  _inherits(Timeout, _FeathersError8);

  function Timeout(message, data) {
    _classCallCheck(this, Timeout);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Timeout).call(this, message, 'Timeout', 408, 'timeout', data));
  }

  return Timeout;
})(FeathersError);

var Conflict = (function (_FeathersError9) {
  _inherits(Conflict, _FeathersError9);

  function Conflict(message, data) {
    _classCallCheck(this, Conflict);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Conflict).call(this, message, 'Conflict', 409, 'conflict', data));
  }

  return Conflict;
})(FeathersError);

var Unprocessable = (function (_FeathersError10) {
  _inherits(Unprocessable, _FeathersError10);

  function Unprocessable(message, data) {
    _classCallCheck(this, Unprocessable);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Unprocessable).call(this, message, 'Unprocessable', 422, 'unprocessable', data));
  }

  return Unprocessable;
})(FeathersError);

var GeneralError = (function (_FeathersError11) {
  _inherits(GeneralError, _FeathersError11);

  function GeneralError(message, data) {
    _classCallCheck(this, GeneralError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(GeneralError).call(this, message, 'GeneralError', 500, 'general-error', data));
  }

  return GeneralError;
})(FeathersError);

var NotImplemented = (function (_FeathersError12) {
  _inherits(NotImplemented, _FeathersError12);

  function NotImplemented(message, data) {
    _classCallCheck(this, NotImplemented);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotImplemented).call(this, message, 'NotImplemented', 501, 'not-implemented', data));
  }

  return NotImplemented;
})(FeathersError);

var Unavailable = (function (_FeathersError13) {
  _inherits(Unavailable, _FeathersError13);

  function Unavailable(message, data) {
    _classCallCheck(this, Unavailable);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Unavailable).call(this, message, 'Unavailable', 503, 'unavailable', data));
  }

  return Unavailable;
})(FeathersError);

var errors = {
  FeathersError: FeathersError,
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