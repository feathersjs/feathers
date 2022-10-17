# Socket.io Client

## @feathersjs/socketio-client

[![npm version](https://img.shields.io/npm/v/@feathersjs/client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/socketio-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/socketio-client/CHANGELOG.md)

```
npm install @feathersjs/socketio-client --save
```

The `@feathersjs/socketio-client` module allows to connect to services exposed through the [Socket.io transport](../socketio.md) via a Socket.io socket.

> **Note:** We recommend using Feathers and the `@feathersjs/socketio-client` module on the client if possible. If however, you want to use a direct Socket.io connection without using Feathers on the client, see the [Direct connection](#direct-connection) section.

<!-- -->

> **Important:** Socket.io is also used to *call* service methods. Using sockets for both calling methods and receiving real-time events is generally faster than using [REST](../express.md). There is therefore no need to use both REST and Socket.io in the same client application.

### socketio(socket)

Initialize the Socket.io client using a given socket and the default options.

:::: tabs :options="{ useUrlFragment: false }"

::: tab "Modular"
``` javascript
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
:::

::: tab "@feathersjs/client"
``` html
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script src="//unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js"></script>
<script src="//unpkg.com/socket.io-client@1.7.3/dist/socket.io.js"></script>
<script>
  // Socket.io is exposed as the `io` global.
  var socket = io('http://api.feathersjs.com');
  // @feathersjs/client is exposed as the `feathers` global.
  var app = feathers();

  // Set up Socket.io client with the socket
  app.configure(feathers.socketio(socket));

  // Receive real-time events through Socket.io
  app.service('messages')
    .on('created', message => console.log('New message created', message));

  // Call the `messages` service
  app.service('messages').create({
    text: 'A message from a REST client'
  });

  // feathers.errors is an object with all of the custom error types.
</script>
```
:::

::::

### app.io

`app.io` contains a reference to the `socket` object passed to `socketio(socket [, options])`

```js
app.io.on('disconnect', (reason) => {
  // Show offline message
});
```

### Custom Methods

On the client, [custom service methods](../services.md#custom-methods) are also registered using the `methods` option when registering the service via `socketClient.service()`:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');

const socket = io('http://api.feathersjs.com');
const client = feathers();
const socketClient = socketio(socket)

// Set up Socket.io client with the socket
client.configure(socketClient);

client.service('myservice', connection.service('myservice'), {
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'myCustomMethod']
});

// Then it can be used like other service methods
client.service('myservice').myCustomMethod(data, params);
```
:::

::: tab "TypeScript"
```typescript
import { feathers, CustomMethod } from '@feathersjs/feathers';
import socketio, { SocketService } from '@feathersjs/socketio-client';
import io from 'socket.io-client';

// `data` and return type of custom method
type CustomMethodData = { name: string }
type CustomMethodResponse = { acknowledged: boolean }

type ServiceTypes = {
  // The type is a Socket service extended with custom methods
  myservice: SocketService & {
    myCustomMethods: CustomMethod<CustomMethodData, CustomMethodResponse>
  }
}

const socket = io('http://api.feathersjs.com');
const client = feathers<ServiceTypes>();
const socketClient = socketio(socket)

// Set up Socket.io client with the socket
client.configure(socketClient);

// Register a socket client service with all methods listed
client.service('myservice', socketClient.service('myservice'), {
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'myCustomMethod']
});

// Then it can be used like other service methods
client.service('myservice').myCustomMethod(data, params);
```
:::

::::

> __Note:__ Just like on the server *all* methods you want to use have to be listed in the `methods` option.

## Direct connection

Feathers sets up a normal Socket.io server that you can connect to with any Socket.io compatible client, usually the [Socket.io client](http://socket.io/docs/client-api/) either by loading the `socket.io-client` module or `/socket.io/socket.io.js` from the server. Unlike HTTP calls, websockets do not have an inherent cross-origin restriction in the browser so it is possible to connect to any Feathers server. Additionally query parameter types do not have to be converted from strings as they do for REST requests.

> **ProTip**: The socket connection URL has to point to the server root which is where Feathers will set up Socket.io.


```html
<!-- Connecting to the same URL -->
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();
</script>

<!-- Connecting to a different server -->
<script src="http://localhost:3030/socket.io/socket.io.js"></script>
<script>
  var socket = io('http://localhost:3030/');
</script>
```

Service methods can be called by emitting a `<methodname>` event followed by the service path and method parameters. The service path is the name the service has been registered with (in `app.use`), without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Socket.io middleware](../socketio.md).

If the service path or method does not exist, an appropriate Feathers error will be returned.

### Authentication

There are two ways to establish an authenticated Socket.io connection. Either by calling the authentication service or by sending authentication headers.

#### Via authentication service

Sockets will be authenticated automatically by calling [.create](#create) on the [authentication service](../authentication/service.md):

```js
const io = require('socket.io-client');
const socket = io('http://localhost:3030');

socket.emit('create', 'authentication', {
  strategy: 'local',
  email: 'hello@feathersjs.com',
  password: 'supersecret'
}, function(error, authResult) {
  console.log(authResult); 
  // authResult will be {"accessToken": "your token", "user": user }
  // You can now send authenticated messages to the server
});
```

> __Important:__ When a socket disconnects and then reconnects, it has to be authenticated again before making any other request that requires authentication. This is usually done with the [jwt strategy](../authentication/jwt.md) using the `accessToken` from the `authResult`. The [authentication client](../authentication/client.md) handles this already automatically.

```js
socket.on('connect', () => {
  socket.emit('create', 'authentication', {
    strategy: 'jwt',
    accessToken: authResult.accessToken
  }, function(error, newAuthResult) {
    console.log(newAuthResult); 
  });
});
```

#### Via handshake headers

If the authentication strategy (e.g. JWT or API key) supports parsing headers, an authenticated websocket connection can be established by adding the information in the [extraHeaders option](https://socket.io/docs/client-api/#With-extraHeaders):

```js
const io = require('socket.io-client');
const socket = io('http://localhost:3030', {
  extraHeaders: {
    Authorization: `Bearer <accessToken here>`
  }
});
```

> __Note:__ The authentication strategy needs to be included in the [`authStrategies` option](../authentication/service.md#configuration).

### find

Retrieves a list of all matching resources from the service

```js
socket.emit('find', 'messages', { status: 'read', user: 10 }, (error, data) => {
  console.log('Found all messages', data);
});
```

Will call `app.service('messages').find({ query: { status: 'read', user: 10 } })` on the server.

### get

Retrieve a single resource from the service.

```js
socket.emit('get', 'messages', 1, (error, message) => {
  console.log('Found message', message);
});
```

Will call `app.service('messages').get(1, {})` on the server.

```js
socket.emit('get', 'messages', 1, { fetch: 'all' }, (error, message) => {
  console.log('Found message', message);
});
```

Will call `app.service('messages').get(1, { query: { fetch: 'all' } })` on the server.

### `create`

Create a new resource with `data` which may also be an array.

```js
socket.emit('create', 'messages', {
  text: 'I really have to iron'
}, (error, message) => {
  console.log('Todo created', message);
});
```

Will call `app.service('messages').create({ text: 'I really have to iron' }, {})` on the server.

```js
socket.emit('create', 'messages', [
  { text: 'I really have to iron' },
  { text: 'Do laundry' }
]);
```

Will call `app.service('messages').create` with the array.

### update

Completely replace a single or multiple resources.

```js
socket.emit('update', 'messages', 2, {
  text: 'I really have to do laundry'
}, (error, message) => {
  console.log('Todo updated', message);
});
```

Will call `app.service('messages').update(2, { text: 'I really have to do laundry' }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.emit('update', 'messages', null, {
  complete: true
}, { complete: false });
```

Will call `app.service('messages').update(null, { complete: true }, { query: { complete: 'false' } })` on the server.

> **ProTip:** `update` is normally expected to replace an entire resource, which is why the database adapters only support `patch` for multiple records.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```js
socket.emit('patch', 'messages', 2, {
  read: true
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `app.service('messages').patch(2, { read: true }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.emit('patch', 'messages', null, {
  complete: true
}, {
  complete: false
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `app.service('messages').patch(null, { complete: true }, { query: { complete: false } })` on the server, to change the status for all read app.service('messages').

### remove

Remove a single or multiple resources:

```js
socket.emit('remove', 'messages', 2, { cascade: true }, (error, message) => {
  console.log('Removed a message', message);
});
```

Will call `app.service('messages').remove(2, { query: { cascade: true } })` on the server. The `id` can also be `null` to remove multiple resources:

```js
socket.emit('remove', 'messages', null, { read: true });
```

Will call `app.service('messages').remove(null, { query: { read: 'true' } })` on the server to delete all read app.service('messages').

### Custom methods

[Custom service methods](../services.md#custom-methods) can be called directly via Socket.io by sending the same message:

```js
socket.emit('myCustomMethod', 'myservice', { message: 'Hello world' }, {}, (error, data) => {
  console.log('Called myCustomMethod', data);
});
```



### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](../events.md) are sent to the socket in the form of `servicepath eventname`.

#### created

The `created` event will be published with the callback data, when a service `create` returns successfully.

```js
var socket = io('http://localhost:3030/');

socket.on('messages created', function(message) {
  console.log('Got a new Todo!', message);
});
```

#### updated, patched

The `updated` and `patched` events will be published with the callback data, when a service `update` or `patch` method calls back successfully.

```js
var socket = io('http://localhost:3030/');

socket.on('my/messages updated', function(message) {
  console.log('Got an updated Todo!', message);
});

socket.emit('update', 'my/messages', 1, {
  text: 'Updated text'
}, {}, function(error, callback) {
 // Do something here
});
```

#### removed

The `removed` event will be published with the callback data, when a service `remove` calls back successfully.

```js
var socket = io('http://localhost:3030/');

socket.on('messages removed', function(message) {
  // Remove element showing the Todo from the page
  $('#message-' + message.id).remove();
});
```

#### Custom events

[Custom events](../events.md#custom-events) can be listened to accordingly:

```js
var socket = io('http://localhost:3030/');

socket.on('messages myevent', function(data) {
  console.log('Got myevent event', data);
});
```
