# @feathersjs/express

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/express.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/express.png?branch=master)](https://travis-ci.org/feathersjs/express)
[![Test Coverage](https://codeclimate.com/github/feathersjs/express/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/express/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/express.svg?style=flat-square)](https://david-dm.org/feathersjs/express)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/express.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/express)

> Feathers Express framework bindings and REST provider

This plugin turns a Feathers v3+ application into a drop-in replacement for any Express application.

## Installation

```
npm install @feathersjs/express --save
```

> _Important:_ This plugin only works with `feathers` 3.0 and later

## Documentation

Please refer to the [@feathersjs/express API documentation](https://docs.feathersjs.com/api/express.html) for more details.

## Complete Example

Here's an example of a Feathers server that uses `@feathersjs/express`. 

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const app = express(feathers());

app.configure(express.rest());
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
