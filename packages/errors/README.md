# @feathersjs/errors

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/errors.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/errors.png?branch=master)](https://travis-ci.org/feathersjs/errors)
[![Test Coverage](https://codeclimate.com/github/feathersjs/errors/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/errors/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/errors.svg?style=flat-square)](https://david-dm.org/feathersjs/errors)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/errors.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/errors)

> Common error types for feathers apps

## Getting Started

Feathers errors come with feathers by default. So typically you don't need to install it at all.

In the event that you do need to install it:

```bash
npm install --save @feathersjs/errors
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

### Usage:

#### Error objects:

```js
import errors from '@feathersjs/errors';

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

#### Error handler:

This plugin will handle all error responses for you automatically. In the case of HTML errors, basic error pages are provided without needing to do anything. In the case of JSON, the error is normalized and serialized as JSON so that your client code will receive a predictable error object every time! 

However, you can customize how errors are sent to the user on a per error code basis. This allows you to easily customize the user experience for different types of errors. If a particular configuration is omitted, it falls back to the default behavior described above.

```js
import feathers from 'feathers';
import errorHandler from 'feathers-errors/handler';

const app = feathers();
// full app configuration omitted for brevity
// configure the error handler last
app.configure(errorHandler({
	html: {
		// strings should point to html files
		404: 'path/to/custom-404.html',
		// functions are treated as middleware
		406: (err, req, res, next) => {
			// handle the error yourself
			res.send(...);
		},
		// Optionally configure your own default behavior.
		default: 'path/to/generic/error-page.html'
	},
	json: {
		404: (err, req, res, next) => {
			// make sure to strip off the stack trace in production
			if (process.env.NODE_ENV === 'production') {
				delete err.stack;
			}
			res.json({ message: 'Not found' });
		},
		default: (err, req, res, next) => {
			// handle all other errors
			res.json({ message: 'Oh no! Something went wrong' });
		}
	}
});
```


## License

Copyright (c) 2017 Feathers Contributors

Licensed under the [MIT license](LICENSE).
