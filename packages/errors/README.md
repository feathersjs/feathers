# feathers-errors

[![Build Status](https://travis-ci.org/feathersjs/feathers-errors.png?branch=master)](https://travis-ci.org/feathersjs/feathers-errors)

> Common error types for feathers apps

## Getting Started

Feathers errors come with feathers by default. So typically you don't need to install it at all.

In the event that you do need to install it:

```bash
npm install --save feathers-errors
```

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

// If you were to create an error yourself.
var notFound = new errors.NotFound('User does not exist');

// You can wrap existing errors
var existing = new errors.GeneralError(new Error('I exist'));

// You can also pass additional data
var data = new errors.BadRequest('Invalid email', {email: 'sergey@google.com'});

// You can also pass additional data
var dataWithoutMessage = new errors.BadRequest({email: 'sergey@google.com'});

// If you need to pass multiple errors
var validationErrors = new errors.BadRequest('Invalid Parameters', {errors: {email: 'Email already taken'} });

// You can also omit the error message and we'll put in a default one for you
var validationErrors = new errors.BadRequest({errors: {email: 'Invalid Email'} });
```

## Release History
__2.4.0__

- Adding ability to get a feathers errors instance by status code

__2.3.0__

- Add a not found error handler. Required using `require('feathers-errors/not-found')`.

__2.1.0__

- converts over to chai for tests
- adds better support for detecting `content-type` and `accepts` headers
- makes JSON the default response
- adds support for passing a custom html handler
- adds support for passing a custom json handler

__2.0.0__
- Moving error handler out of default bundle so that it doesn't break React Native and browser builds. Now needs to be required using `require('feathers-errors/handler')`.

__1.2.0__
- Adding error handler and basic static error pages back in

__1.1.2__
- Adding more tests
- Adding even more flexibility for handling multiple errors

__1.1.1__
- Fixing critical bug [#15](https://github.com/feathersjs/feathers-errors/issues/15)

__1.1.0__
- Adding better support for multiple errors

__1.0.0__
 - converting to ES6
 - making structure consistent with other plugins
 - removing error handlers [#11](https://github.com/feathersjs/feathers-errors/issues/11)

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
