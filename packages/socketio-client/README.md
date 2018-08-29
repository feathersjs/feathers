# @feathersjs/socketio-client

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/socketio-client)](https://david-dm.org/feathersjs/feathers?path=packages/socketio-client)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/socketio-client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/socketio-client)

> The client for Socket.io Feathers connections

## Installation

```
npm install @feathersjs/socketio-client --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');

const socket = io('http://api.feathersjs.com');
const app = feathers();

// Set up Socket.io client with the socket
app.configure(socketio(socket));

// Receive real-time events through Socket.io
app.service('messages')
  .on('created', message => console.log('New message created', message));

// Call the `messages` service
app.service('messages').create({
  text: 'A message from a REST client'
});
```

## Documentation

Please refer to the [@feathersjs/socketio-client documentation](https://docs.feathersjs.com/api/client/socketio.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
