# feathers-errors [![Build Status](https://travis-ci.org/feathersjs/feathers-errors.svg?branch=master)](https://travis-ci.org/feathersjs/feathers-errors)

> Error handling mixin for Feathers apps.

## Getting Started

Install the module with: `npm install feathers-errors --save`

```js
var feathers = require('feathers');
var errors = require('feathers-errors');
var memory = require('feathers-memory');

var app = feathers().configure(errors())
  .use('/users', memory)
  .use(errors.handler);
```

## Documentation

#### Current Error Types:

* `GeneralError`: 500
* `BadRequest`: 400
* `NotAuthenticated`: 401
* `Forbidden`: 403
* `NotFound`: 404
* `Timeout`: 409
* `Conflict`: 409
* `PaymentError`: 409
* `Unprocessable`: 422

**Pro Tip:** Feathers service adapters (ie. mongodb, memory, etc.) already emit the appropriate errors for you. :-)

#### Usage:

```js
var feathers = require('feathers');
var errors = require('feathers-errors');
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

app.configure(errors())
   .use('/users', userService)
   .use(errors.handler);
```

#### 404 Handling:

We have conveniently created a basic 404 middleware as well. To use it:

```js
var feathers = require('feathers');
var errors = require('feathers-errors');
var app = feathers();

app.configure(errors())
   .use('/users', userService)
   .use(errors.missing) // your 404 handler
   .use(errors.handler);
```

## Examples
See [examples directory](https://github.com/feathersjs/feathers-errors/tree/master/examples).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
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
