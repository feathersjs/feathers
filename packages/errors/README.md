# feathers-errors

[![Build Status](https://travis-ci.org/feathersjs/feathers-errors.png?branch=master)](https://travis-ci.org/feathersjs/feathers-errors)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-errors.png)](https://codeclimate.com/github/feathersjs/feathers-errors)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-errors/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-errors/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-errors.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-errors)
[![Download Status](https://img.shields.io/npm/dm/feathers-errors.svg?style=flat-square)](https://www.npmjs.com/package/feathers-errors)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

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
* `LengthRequired`: 411
* `Unprocessable`: 422
* `TooManyRequests`: 429
* `GeneralError`: 500
* `NotImplemented`: 501
* `BadGateway`: 502
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

## License

Copyright (c) 2016 Feathers Contributors

Licensed under the [MIT license](LICENSE).
