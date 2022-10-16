# Socket.io

[![npm version](https://img.shields.io/npm/v/@feathersjs/socketio.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/socketio)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/socketio/CHANGELOG.md)

```
npm install @feathersjs/socketio --save
```

The [@feathersjs/socketio](https://github.com/feathersjs/socketio) module allows to call [service methods](./services.md) and receive [real-time events](./events.md) via [Socket.io](http://socket.io/), a NodeJS library which enables real-time bi-directional, event-based communication.

> **Important:** This page describes how to set up a Socket.io server. The [Socket.io client chapter](./client/socketio.md) shows how to connect to this server on the client and the message format for service calls and real-time events.

## Configuration

`@feathersjs/socketio` can be used standalone or together with a Feathers framework integration like [Express](./express.md).

### app.configure(socketio())

Sets up the Socket.io transport with the default configuration using either the server provided by [app.listen](./application.md#listenport) or passed in [app.setup(server)](./application.md#setupserver).

```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');

const app = feathers();

app.configure(socketio());

app.listen(3030);
```

> **Pro tip:** Once the server has been started with `app.listen()` or `app.setup(server)` the Socket.io object is available as `app.io`.

### app.configure(socketio(callback))

Sets up the Socket.io transport with the default configuration and call `callback` with the [Socket.io server object](http://socket.io/docs/server-api/). This is a good place to listen to custom events or add [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing):

```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');

const app = feathers();

app.configure(socketio(function(io) {
  io.on('connection', function(socket) {
    socket.emit('news', { text: 'A client connected!' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });
  
  // Registering Socket.io middleware
  io.use(function (socket, next) {
    // Exposing a request property to services and hooks
    socket.feathers.referrer = socket.request.referrer;
    next();
  });
}));

app.listen(3030);
```

### app.configure(socketio(options [, callback]))

Sets up the Socket.io transport with the given [Socket.io options object](https://github.com/socketio/engine.io#methods-1) and optionally calls the callback described above.

This can be used to e.g. configure the path where Socket.io is initialize (`socket.io/` by default). The following changes the path to `ws/`:


```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');

const app = feathers();

app.configure(socketio({
  path: '/ws/'
}, function(io) {
  // Do something here
  // This function is optional
}));

app.listen(3030);
```

### app.configure(socketio(port, [options], [callback]))

Creates a new Socket.io server on a separate port. Options and a callback are optional and work as described above.

```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');

const app = feathers();

app.configure(socketio(3031));
app.listen(3030);
```

## params

[Socket.io middleware](https://socket.io/docs/v4/middlewares/) can modify the `feathers` property on the `socket` which will then be used as the service call `params`:

```js
app.configure(socketio(function(io) {
  io.use(function (socket, next) {
    socket.feathers.user = { name: 'David' };
    next();
  });
}));

app.use('messages', {
  create(data, params, callback) {
    // When called via SocketIO:
    params.provider // -> socketio
    params.user // -> { name: 'David' }
  }
});
```

> __Note:__ `socket.feathers` is the same object as the `connection` in a [channel](./channels.md). `socket.request` and `socket.handshake` contains information the HTTP request that initiated the connection (see the [Socket.io documentation](https://socket.io/docs/server-api/#socket-request)).

### params.provider

For any [service method call](./services.md) made through Socket.io `params.provider` will be set to `socketio`. In a [hook](./hooks.md) this can for example be used to prevent external users from making a service method call:

```js
app.service('users').hooks({
  before: {
    remove(context) {
      // check for if(context.params.provider) to prevent any external call
      if(context.params.provider === 'socketio') {
        throw new Error('You can not delete a user via Socket.io');
      }
    }
  }
});
```

### params.query

`params.query` will contain the query parameters sent from the client.

> **Important:** Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to `params` in a before [hook](./hooks.md).

### params.connection

`params.connection` is the connection object that can be used with [channels](./channels.md). It is the same object as `socket.feathers` in a Socket.io middleware as [shown in the `params` section](#params).
