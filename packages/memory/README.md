# @feathersjs/memory

[![CI](https://github.com/feathersjs/feathers/workflows/CI/badge.svg)](https://github.com/feathersjs/feathers/actions?query=workflow%3ACI)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/memory)](https://david-dm.org/feathersjs/feathers?path=packages/memory)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/memory.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/memory)

A [Feathers](https://feathersjs.com) service adapter for in-memory data storage that works on all platforms.

```bash
$ npm install --save @feathersjs/memory
```

> __Important:__ `@feathersjs/memory` implements the [Feathers Common database adapter API](https://docs.feathersjs.com/api/databases/common.html) and [querying syntax](https://docs.feathersjs.com/api/databases/querying.html).


## API

### `service([options])`

Returns a new service instance initialized with the given options.

```js
const service = require('@feathersjs/memory');

app.use('/messages', service());
app.use('/messages', service({ id, startId, store, events, paginate }));
```

__Options:__

- `id` (*optional*, default: `'id'`) - The name of the id field property.
- `startId` (*optional*, default: `0`) - An id number to start with that will be incremented for every new record (unless it is already set).
- `store` (*optional*) - An object with id to item assignments to pre-initialize the data store
- `events` (*optional*) - A list of [custom service events](https://docs.feathersjs.com/api/events.html#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](https://docs.feathersjs.com/api/databases/common.html#pagination) containing a `default` and `max` page size
- `whitelist` (*optional*) - A list of additional query parameters to allow
- `multi` (*optional*) - Allow `create` with arrays and `update` and `remove` with `id` `null` to change multiple items. Can be `true` for all methods or an array of allowed methods (e.g. `[ 'remove', 'create' ]`)

## Example

Here is an example of a Feathers server with a `messages` in-memory service that supports pagination:

```
$ npm install @feathersjs/feathers @feathersjs/express @feathersjs/socketio @feathersjs/errors @feathersjs/memory
```

In `app.js`:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const memory = require('@feathersjs/memory');

// Create an Express compatible Feathers application instance.
const app = express(feathers());
// Turn on JSON parser for REST services
app.use(express.json());
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Enable REST services
app.configure(express.rest());
// Enable REST services
app.configure(socketio());
// Create an in-memory Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/messages', memory({
  paginate: {
    default: 2,
    max: 4
  }
}));
// Set up default error handler
app.use(express.errorHandler());

// Create a dummy Message
app.service('messages').create({
  text: 'Message created on server'
}).then(message => console.log('Created message', message));

// Start the server.
const port = 3030;

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`)
});
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).

## License

Copyright (c) 2021 [Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)

Licensed under the [MIT license](LICENSE).
