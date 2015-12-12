# feathers-errors

[![Build Status](https://travis-ci.org/feathersjs/feathers-errors.png?branch=master)](https://travis-ci.org/feathersjs/feathers-errors)

> Common error types for feathers apps

## Getting Started

Feathers errors come with feathers by default. So typically you don't need to install it at all.

## Documentation

#### Current Error Types:

* `BadRequest`: 400
* `NotAuthenticated`: 401
* `PaymentError`: 402
* `Forbidden`: 403
* `NotFound`: 404
* `MethodNotAllowed`: 405
* `NotAcceptable`: 406
* `Timeout`: 408
* `Conflict`: 409
* `Unprocessable`: 422
* `GeneralError`: 500
* `NotImplemented`: 501
* `Unavailable`: 503

**Pro Tip:** Feathers service adapters (ie. mongodb, memory, etc.) already emit the appropriate errors for you. :-)

#### Usage:

```js
import errors from 'feathers-errors';

let userService = {
  find(params, callback) {

    // If you were to create an error yourself.
    callback(new errors.NotFound('User does not exist'));

    // You can also simply do something like this if you
    // just want to fire back a simple 500 error with your
    // custom message.
    // 
    // callback('A generic server error');
  }
};
```

## Release History
__0.2.0__

- Adding support for mongoose errors [Issue #5](https://github.com/feathersjs/feathers-errors/issues/5).

__0.1.4__

- Adding more error types
- Changing `missing` to `fourOhFour`
- Making library feathers core compatible

__0.1.3__

- Adding a default error page

__0.1.2__

- Minor bug fixes

__0.1.1__

- Exposing error types directly via `var types = require('feathers-errors').types;`

__0.1.0__

- Initial release

## License

Copyright (c) 2015 Feathers Contributors

Licensed under the [MIT license](LICENSE).
