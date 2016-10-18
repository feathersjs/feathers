# feathers-authentication-local

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-local.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-local)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-local/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-local)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-local/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-local/coverage)
[![Issue Count](https://codeclimate.com/github/feathersjs/feathers-authentication-local/badges/issue_count.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-local)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-local.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-local)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-local.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-local)

> Local authentication strategy for feathers-authentication

## Installation

```
npm install feathers-authentication-local --save
```

## Documentation

Please refer to the [feathers-authentication-local documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `feathers-authentication-local`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('feathers-authentication-local');

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
