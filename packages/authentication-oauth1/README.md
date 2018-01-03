# @feathersjs/authentication-oauth1

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/authentication-oauth1.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/authentication-oauth1.png?branch=master)](https://travis-ci.org/feathersjs/authentication-oauth1)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c8bd6a04ca7085e78e5f/test_coverage)](https://codeclimate.com/github/feathersjs/authentication-oauth1/test_coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/authentication-oauth1.svg?style=flat-square)](https://david-dm.org/feathersjs/authentication-oauth1)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/authentication-oauth1.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-oauth1)

> A Feathers OAuth1 authentication strategy

## Installation

```
npm install @feathersjs/authentication-oauth1 --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const authentication = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const oauth1 = require('@feathersjs/authentication-oauth1');
const session = require('express-session');
const TwitterStrategy = require('passport-twitter').Strategy;
const app = feathers();

// Setup in memory session
app.use(session({
  secret: 'super secret',
  resave: true,
  saveUninitialized: true
}));

// Setup authentication
app.configure(authentication(settings));
app.configure(jwt());
app.configure(oauth1({
  name: 'twitter',
  Strategy: TwitterStrategy,
  consumerKey: '<your consumer key>',
  consumerSecret: '<your consumer secret>'
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

Please refer to the [@feathersjs/authentication-oauth1 documentation](http://docs.feathersjs.com/) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
