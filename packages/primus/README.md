# @feathersjs/primus

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/primus.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/primus.png?branch=master)](https://travis-ci.org/feathersjs/primus)
[![Test Coverage](https://codeclimate.com/github/feathersjs/primus/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/primus/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/primus.svg?style=flat-square)](https://david-dm.org/feathersjs/primus)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/primus.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/primus)

> The Feathers Primus real-time API provider

## Installation

```
npm install @feathersjs/primus --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const primus = require('@feathersjs/primus');

const app = feathers();

// Set up Primus with SockJS
app.configure(primus({ transformer: 'ws' }));

app.listen(3030);
```

## Documentation

Please refer to the [@feathersjs/primus documentation](https://docs.feathersjs.com/api/primus.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
