# @feathersjs/socketio

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/socketio.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/socketio.png?branch=master)](https://travis-ci.org/feathersjs/socketio)
[![Test Coverage](https://codeclimate.com/github/feathersjs/socketio/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/socketio/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/socketio.svg?style=flat-square)](https://david-dm.org/feathersjs/socketio)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/socketio.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/socketio)

> The Feathers Socket.io real-time API provider

## About

This provider exposes [Feathers](http://feathersjs.com) services through a [Socket.io](http://socket.io/) real-time API. It is compatible with Feathers 1.x and 2.x.

__Note:__ For the full API documentation go to [https://docs.feathersjs.com/api/socketio.html](https://docs.feathersjs.com/api/socketio.html).

## Quick example

```js
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';

const app = feathers()
  .configure(socketio(function(io) {
    io.on('connection', function(socket) {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });

    io.use(function(socket, next) {
      socket.feathers.data = 'Hello world';
      next();
    });

    io.use(function (socket, next) {
      // Authorize using the /users service
      app.service('users').find({
        username: socket.request.username,
        password: socket.request.password
      }, next);
    });
  }));

app.use('/todos', {
  get: function(id, params) {
    console.log(params.data); // -> 'Hello world'

    return Promise.resolve({
      id,
      description: `You have to do ${name}!`
    });
  }
});
```

## Client use

```js
import io from 'socket.io-client';
import feathers from 'feathers/client';
import socketio from '@feathersjs/socketio/client';

const socket = io('http://path/to/api');
const app = feathers()
  .configure(socketio(socket));
```

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
