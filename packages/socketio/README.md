# @feathersjs/socketio

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/socketio)](https://david-dm.org/feathersjs/feathers?path=packages/socketio)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/socketio.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/socketio)

> The Feathers Socket.io real-time API provider

## Installation

```
npm install @feathersjs/socketio --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');

const app = feathers();

app.configure(socketio());

app.listen(3030);
```

## Documentation

Please refer to the [@feathersjs/socketio documentation](https://docs.feathersjs.com/api/socketio.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
