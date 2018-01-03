# @feathersjs/authentication-client

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/authentication-client.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/authentication-client.png?branch=master)](https://travis-ci.org/feathersjs/authentication-client)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b2d2b018d2bf75f9bcc8/test_coverage)](https://codeclimate.com/github/feathersjs/authentication-client/test_coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/authentication-client.svg?style=flat-square)](https://david-dm.org/feathersjs/authentication-client)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/authentication-client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-client)

> The authentication plugin for feathers-client

## Installation

```
npm install @feathersjs/authentication-client --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const auth = require('@feathersjs/authentication-client');

const app = feathers();

// Available options are listed in the "Options" section
app.configure(auth({
  storage: window.localStorage
}))
```

## Documentation

Please refer to the [@feathersjs/authentication-client documentation](https://docs.feathersjs.com/api/authentication/client.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
