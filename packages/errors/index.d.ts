declare namespace FeathersErrors {
  class FeathersError extends Error {
    constructor(msg: string | Error, name: string, code: number, className: String, data: any)
  }

  class BadRequest extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class NotAuthenticated extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class PaymentError extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class Forbidden extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class NotFound extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class MethodNotAllowed extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class NotAcceptable extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class Timeout extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class Conflict extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class LengthRequired extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class Unprocessable extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class TooManyRequests extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class GeneralError extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class NotImplemented extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class BadGateway extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }

  class Unavailable extends FeathersError {
    constructor(msg: string | Error, data?: any);
  }
}

declare namespace FeathersErrors {
  interface ErrorContainer {
    FeathersError: FeathersErrors.FeathersError;
    BadRequest: FeathersErrors.BadRequest;
    NotAuthenticated: FeathersErrors.NotAuthenticated;
    PaymentError: FeathersErrors.PaymentError;
    Forbidden: FeathersErrors.Forbidden;
    NotFound: FeathersErrors.NotFound;
    MethodNotAllowed: FeathersErrors.MethodNotAllowed;
    NotAcceptable: FeathersErrors.NotAcceptable;
    Timeout: FeathersErrors.Timeout;
    Conflict: FeathersErrors.Conflict;
    LengthRequired: FeathersErrors.LengthRequired;
    Unprocessable: FeathersErrors.Unprocessable;
    TooManyRequests: FeathersErrors.TooManyRequests;
    GeneralError: FeathersErrors.GeneralError;
    NotImplemented: FeathersErrors.NotImplemented;
    BadGateway: FeathersErrors.BadGateway;
    Unavailable: FeathersErrors.Unavailable;
  }

  function convert(error: any): FeathersError
  const types: ErrorContainer
  const errors: ErrorContainer
}

export = FeathersErrors;
