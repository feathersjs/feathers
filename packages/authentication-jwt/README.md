# @feathersjs/authentication-jwt

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/authentication-jwt.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/authentication-jwt.png?branch=master)](https://travis-ci.org/feathersjs/authentication-jwt)
[![Test Coverage](https://codeclimate.com/github/feathersjs/authentication-jwt/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/authentication-jwt/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/authentication-jwt.svg?style=flat-square)](https://david-dm.org/feathersjs/authentication-jwt)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/authentication-jwt.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-jwt)

> JWT authentication strategy for feathers-authentication using Passport

## Installation

```
npm install @feathersjs/authentication-jwt --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const authentication = require('feathers-authentication');
const jwt = require('@feathersjs/authentication-jwt');
const app = feathers();

// Setup authentication
app.configure(authentication(settings));
app.configure(jwt());

// Setup a hook to only allow valid JWTs to authenticate
// and get new JWT access tokens
app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(['jwt'])
    ]
  }
});
```

## Documentation

Please refer to the [@feathersjs/authentication-jwt documentation](https://docs.feathersjs.com/api/authentication/jwt.html) for more details.


## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
