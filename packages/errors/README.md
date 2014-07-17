# feathers-errors [![Build Status](https://travis-ci.org/feathersjs/feathers-errors.svg?branch=master)](https://travis-ci.org/feathersjs/feathers-errors)

> Error handling mixin for Feathers apps.

## Getting Started

Feathers errors come with feathers by default. So typically you don't need to install it at all. However you can also use `feathers-errors` with express directly as well. In that case you install the module with: `npm install feathers-errors --save`

#### With Feathers

```js
var feathers = require('feathers');
var memory = require('feathers-memory');

var app = feathers()
    .use('/users', memory)
    .configure(feathers.errors());
```

#### With Express

```js
var app = require('express');
var errors = require('feathers-errors');

var app = express()
    .use(errors.fourOhFour)
    .use(errors.handler);
```

**Pro Tip:** Just like express middleware, **order matters**. So your error handling should typically be configured last.

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
var feathers = require('feathers');
var app = feathers();

var userService = {
  find: function(params, callback) {

    // If you were to create an error yourself.
    callback(new this.app.errors.NotFound('User does not exist'));

    // You can also simply do something like this if you
    // just want to fire back a simple 500 error with your
    // custom message.
    // 
    // callback('A generic server error');
  },

  setup: function(app){
    this.app = app;
  }
};

app.use('/users', userService)
   .configure(feathers.errors());
```

#### 404 Handling:

We have conveniently created a basic 404 middleware already for you. If you want to override it, do this:

```js
var feathers = require('feathers');
var app = feathers();

app.use('/users', userService)
   .configure(feathers.errors({
      fourOhFour: function(req, res, next){
        // Handle your 404's some special way
      }
   }));
```

#### Custom Error Handling:

We already have an error handler that gets added to the middleware stack when you call `feathers.errors()`. However, if you want customize how you handle errors you can do so like this:

```js
var feathers = require('feathers');
var app = feathers();

app.use('/users', userService)
   .configure(feathers.errors({
      handler: function(req, res, next){
        // Handle your errors the way you want
      }
   }));
```

## Examples
See [examples directory](https://github.com/feathersjs/feathers-errors/tree/master/examples).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

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
Copyright (c) 2014 [Eric Kryski](https://github.com/ekryski)
Licensed under the [MIT license](https://github.com/feathersjs/feathers-errors/blob/master/LICENSE-MIT).
