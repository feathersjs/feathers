# feathers-authentication-oauth1

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-oauth1.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-oauth1)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth1/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth1)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth1/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth1/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-oauth1.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-oauth1)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-oauth1.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-oauth1)

> A Feathers OAuth1 authentication strategy

## Installation

```
npm install feathers-authentication-oauth1 --save
```

## Documentation

Please refer to the [feathers-authentication-oauth1 documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `feathers-authentication-oauth1`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('feathers-authentication-oauth1');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/plugin', plugin())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
