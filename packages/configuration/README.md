# @feathersjs/configuration

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/configuration)](https://david-dm.org/feathersjs/feathers?path=packages/configuration)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/configuration.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/configuration)

> A small configuration module for your Feathers application.

## About

`@feathersjs/configuration` is a module that wraps [node-config](https://github.com/lorenwest/node-config) to configure your Feathers application.

> npm install @feathersjs/configuration

```js
const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');

// Use the application root and `config/` as the configuration folder
let app = feathers().configure(configuration())
```

See the [Feathers configuration docs](https://docs.feathersjs.com/api/configuration.html) for the full API usage.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
