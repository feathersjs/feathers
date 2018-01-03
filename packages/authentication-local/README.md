# @feathersjs/authentication-local

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/authentication-local.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/authentication-local.png?branch=master)](https://travis-ci.org/feathersjs/authentication-local)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d948ae0f5b7572578d5a/test_coverage)](https://codeclimate.com/github/feathersjs/authentication-local/test_coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/authentication-local.svg?style=flat-square)](https://david-dm.org/feathersjs/authentication-local)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/authentication-local.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-local)

> Local authentication strategy for feathers-authentication using Passport without all the boilerplate.

## Installation

```
npm install @feathersjs/authentication-local --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const authentication = require('feathers-authentication');
const local = require('@feathersjs/authentication-local');
const app = feathers();

// Setup authentication
app.configure(authentication(settings));
app.configure(local());

// Setup a hook to only allow valid JWTs or successful 
// local auth to authenticate and get new JWT access tokens
app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(['local', 'jwt'])
    ]
  }
});
```

## Documentation

Please refer to the [@feathersjs/authentication-local API documentation](https://docs.feathersjs.com/api/authentication/local.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
