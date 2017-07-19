# feathers-express

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-express.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-express.png?branch=master)](https://travis-ci.org/feathersjs/feathers-express)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-express/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-express)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-express/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-express/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-express.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-express)
[![Download Status](https://img.shields.io/npm/dm/feathers-express.svg?style=flat-square)](https://www.npmjs.com/package/feathers-express)

> Feathers Express framework bindings and REST provider

This plugin turns a Feathers v3+ application into a drop-in replacement for any Express application.

## Installation

```
npm install feathers-express --save
```

> _Important:_ This plugin only works with `feathers` 3.0 and later

## Documentation

Please refer to the [feathers-express API documentation](https://docs.feathersjs.com/api/express.html) for more details.

## Complete Example

Here's an example of a Feathers server that uses `feathers-express`. 

```js
const feathers = require('feathers');
const expressify = require('feathers-express');

const app = expressify(feathers());

app.use('/myservice', {
  get(id) {
    return Promise.resolve({ id });
  }
});

app.use((req, res) => res.json({ message: 'Hello world' }));

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
