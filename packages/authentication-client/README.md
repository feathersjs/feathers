# @feathersjs/authentication-client

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/authentication-client)](https://david-dm.org/feathersjs/feathers?path=packages/authentication-client)
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
