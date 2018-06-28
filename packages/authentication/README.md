# @feathersjs/authentication

[![Build Status](https://travis-ci.org/feathersjs/authentication.png?branch=master)](https://travis-ci.org/feathersjs/authentication)
[![Dependency Status](https://img.shields.io/david/feathersjs/authentication.svg?style=flat-square)](https://david-dm.org/feathersjs/authentication)
[![Maintainability](https://api.codeclimate.com/v1/badges/65abe50ec85244072ee9/maintainability)](https://codeclimate.com/github/feathersjs/authentication/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/65abe50ec85244072ee9/test_coverage)](https://codeclimate.com/github/feathersjs/authentication/test_coverage)

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/authentication.svg)](https://greenkeeper.io/)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/authentication.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)

> Add Authentication to your FeathersJS app.

`@feathersjs/authentication` adds shared [PassportJS](http://passportjs.org/) authentication for Feathers HTTP REST and WebSocket transports using [JSON Web Tokens](http://jwt.io/).

## Installation

```
npm install @feathersjs/authentication --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const auth = require('@feathersjs/authentication');
const local = require('@feathersjs/authentication-local');
const jwt = require('@feathersjs/authentication-jwt');
const memory = require('feathers-memory');

const app = express(feathers());
app.configure(express.rest())
 .configure(socketio())
 .use(express.json())
 .use(express.urlencoded({ extended: true }))
 .configure(auth({ secret: 'supersecret' }))
 .configure(local())
 .configure(jwt())
 .use('/users', memory())
 .use('/', express.static(__dirname + '/public'))
 .use(express.errorHandler());

app.service('users').hooks({
  // Make sure `password` never gets sent to the client
  after: local.hooks.protect('password')
});

app.service('authentication').hooks({
 before: {
  create: [
   // You can chain multiple strategies
   auth.hooks.authenticate(['jwt', 'local'])
  ],
  remove: [
   auth.hooks.authenticate('jwt')
  ]
 }
});

// Add a hook to the user service that automatically replaces
// the password with a hash of the password before saving it.
app.service('users').hooks({
 before: {
  find: [
   auth.hooks.authenticate('jwt')
  ],
  create: [
   local.hooks.hashPassword({ passwordField: 'password' })
  ]
 }
});

const port = 3030;
let server = app.listen(port);
server.on('listening', function() {
 console.log(`Feathers application started on localhost:${port}`);
});
```

## Documentation

Please refer to the [@feathersjs/authentication API documentation](https://docs.feathersjs.com/api/authentication/server.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
