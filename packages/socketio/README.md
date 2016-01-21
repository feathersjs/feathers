# feathers-socketio

[![Build Status](https://travis-ci.org/feathersjs/feathers-socketio.png?branch=master)](https://travis-ci.org/feathersjs/feathers-socketio)

> The Feathers Socket.io real-time API provider

## About

This provider exposes [Feathers](http://feathersjs.com) services through a [Socket.io](http://socket.io/) real-time API. It is compatible with Feathers 1.x and 2.x.

__Note:__ For the full API documentation go to [feathersjs.com/docs/providers.html](http://feathersjs.com/docs/providers.html).

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

## Changelog

__1.2.0__

- Added event filtering support (see [feathers-socketio/2](https://github.com/feathersjs/feathers-socketio/issues/2))

__1.1.0__

- Added Socket.io client and browser mapping for universal module usage

__1.0.0__

- Initial release of extracted module from Feathers 1.3

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
