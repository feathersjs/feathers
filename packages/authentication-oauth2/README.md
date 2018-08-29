# @feathersjs/authentication-oauth2

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/authentication-oauth2)](https://david-dm.org/feathersjs/feathers?path=packages/authentication-oauth2)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/authentication-oauth2.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-oauth2)

> An OAuth2 authentication strategy for feathers-authentication using Passport

## Installation

```
npm install @feathersjs/authentication-oauth2 --save
```

**Note:** This is only compatibile with `feathers-authentication@1.x` and above.

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const authentication = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const oauth2 = require('@feathersjs/authentication-oauth2');
const FacebookStrategy = require('passport-facebook').Strategy;
const app = feathers();

// Setup authentication
app.configure(authentication(settings));
app.configure(jwt());
app.configure(oauth2({
  name: 'facebook',
  Strategy: FacebookStrategy,
  clientID: '<your client id>',
  clientSecret: '<your client secret>',
  scope: ['public_profile', 'email']
}));

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

Please refer to the [@feathersjs/authentication-oauth2 API documentation](https://docs.feathersjs.com/api/authentication/oauth2.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
