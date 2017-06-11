# feathers-express

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-express.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-express.png?branch=master)](https://travis-ci.org/feathersjs/feathers-express)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-express/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-express)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-express/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-express/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-express.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-express)
[![Download Status](https://img.shields.io/npm/dm/feathers-express.svg?style=flat-square)](https://www.npmjs.com/package/feathers-express)

> Feathers Express framework bindings and REST provider

## Installation

```
npm install feathers-express --save
```

## Documentation

Please refer to the [feathers-express documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `feathers-express`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('feathers-express');

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
