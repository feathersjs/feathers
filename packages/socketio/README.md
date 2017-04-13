# feathers-socketio

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-socketio.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-socketio.png?branch=master)](https://travis-ci.org/feathersjs/feathers-socketio)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-socketio/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-socketio)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-socketio/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-socketio/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-socketio.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-socketio)
[![Download Status](https://img.shields.io/npm/dm/feathers-socketio.svg?style=flat-square)](https://www.npmjs.com/package/feathers-socketio)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> The Feathers Socket.io real-time API provider

## About

This provider exposes [Feathers](http://feathersjs.com) services through a [Socket.io](http://socket.io/) real-time API. It is compatible with Feathers 1.x and 2.x.

__Note:__ For the full API documentation go to [http://docs.feathersjs.com/real-time/socket-io.html](http://docs.feathersjs.com/real-time/socket-io.html).

## Quick example

```js
import feathers from 'feathers';
import socketio from 'feathers-socketio';

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
import socketio from 'feathers-socketio/client';

const socket = io('http://path/to/api');
const app = feathers()
  .configure(socketio(socket));
```

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
