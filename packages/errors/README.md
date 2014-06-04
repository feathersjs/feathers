# feathers-errors [![Build Status](https://secure.travis-ci.org/feathersjs/feathers-errors.png?branch=master)](http://travis-ci.org/feathersjs/feathers-errors)

> Error handling mixin for Feathers apps.

## Getting Started

Install the module with: `npm install feathers-errors --save`

```js
var feathers = require('feathers');
var errors = require('feathers-errors');

var app = feathers().configure(errors())
  .use('/users', userService)
  .use('/posts', postsService)
  .use(errors.handler);
```

## Documentation

__Definition and use with REST URIs:__

```js
// Both associations should only work if there is a /users service registered already
app.use('/users', userService)
  .use('/posts', postsService)
  .use('/accounts', accountService);

// Pass service name in an array
// Calls postsService.findAll({ userId: <userId> })
app.associate('/users/:userId/posts', ['posts']);

// Calls userService.get(<userId>) then calls
// accountService.get(user.account)
app.associate('/users/:userId/account', 'accounts');
```

__For SocketIO:__

```js
socket.emit('/users/:userId/posts', { userId: 123 }, function(error, posts) {
});
```


## Examples
See [examples directory](https://github.com/feathersjs/feathers-errors/tree/master/examples).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 [Eric Kryski](https://github.com/ekryski)
Licensed under the [MIT license](https://github.com/feathersjs/feathers-errors/blob/master/LICENSE-MIT).
