# @feathersjs/transport-commons

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/transport-commons.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/transport-commons.png?branch=master)](https://travis-ci.org/feathersjs/transport-commons)
[![Maintainability](https://api.codeclimate.com/v1/badges/87c506753cb9fc6a8b87/maintainability)](https://codeclimate.com/github/feathersjs/transport-commons/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/87c506753cb9fc6a8b87/test_coverage)](https://codeclimate.com/github/feathersjs/transport-commons/test_coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/transport-commons.svg?style=flat-square)](https://david-dm.org/feathersjs/transport-commons)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/transport-commons.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/transport-commons)

> Shared functionality for Feathers API transports like [@feathers/socketio](https://github.com/feathersjs/socketio) and [@feathersjs/primus](https://github.com/feathersjs/primus). Only intended to be used internally.

## About

`@feathersjs/transport-commons` contains internal shared functionality for Feathers real-time providers (currently Socket.io and Primus).

`lib/client.js` is a base socket service client
`lib/index.js` returns a configurable function and requires the following options:

- `done` - A Promise that resolves once the real-time protocol server has been set up
- `emit` - The name of the method to emit data to a socket (`'emit'` for Socket.io and `'send'` for Primus)
- `socketKey` - A string or ES6 Symbol which stores the actual socket connection
- `getParams` - A function that returns the Feathers connection options for a socket

## Channels

Channels provide channel functionality for bi-directional Feathers service providers. It is e.g. used by the Socket.io and Primus provider to quickly determine what messages to send to connected clients.

```
const channels = require('@feathersjs/transport-commons/lib/channels');
```

## Documentation

### `app.channel(... names)`

Returns a named or combined channel object.

```js
const channel = app.channel('test'); // return a `test` channel

channel.join(connection); // join a channel
channel.leave(connection); // leave a channel

channel.filter(connection => {}) // return a new channel with filtered connections
channel.length // return the number of connections
channel.connections // all connections in this channel

const combined = app.channel('test', 'other'); // return a combined channel

combined.join(connection); // join the `test` and `other` channel
combined.leave(connection); // leave the `test` and `other` channel

channel.filter(connection => {}) // return a new channel with filtered connections (connections will only be iterated once)
combined.length // return the number of connections
combined.connections // all connections in the combined channel (if a connection is in multiple channels it will only show once)
```

### `app.service('servicename').publish(event, callback)`, `app.service('servicename').publish(callback)`

Register a publishing callback for a service and event (or all events) that returns a (named or combined) channel.

```js
app.use('/test', {
  create(data) {
    return Promise.resolve(data);
  }
});

// `created` event for the `test` service
app.service('test').publish('created', (data, hook) =>
  app.channel('*')
);

// `created` event for the `test` service, sending different data to two different channels
app.service('test').publish('created', (data, hook) => {
  return [
    app.channel('admins'),
    app.channel('users').send(_.omit(data, 'groups', 'email'))
  ];
});

// All events for all services
app.publish((data, hook) =>
  app.channel('*')
);

// All `created` events for all services
app.publish('created', (data, hook) =>
  app.channel('*')
);

// All events for `test` service
app.service('test').publish((data, hook) =>
  app.channel('*')
);
```

### `app.on('publish', function(event, channel, hook) {})`

An event that will be sent every time a service event that has connections to publish to happens. `channel` is a combined channel with all connections to publish the event to.

> _Note:_ If there are no channels or connections the `publish` event will not be sent.

```js
app.on('publish', (event, channel, hook) => {
  channel.connections.forEach(connection => {
    // Do something with `connection`
  });
});
```

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
