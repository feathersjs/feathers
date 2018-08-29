# @feathersjs/authentication-local

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/authentication-local)](https://david-dm.org/feathersjs/feathers?path=packages/authentication-local)
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
