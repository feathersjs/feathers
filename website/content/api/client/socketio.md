# Socket.io Client

## socketio-client

::badges{npm="@feathersjs/socketio-client" changelog="https://github.com/feathersjs/feathers/blob/dove/packages/socketio-client/CHANGELOG.md"}
::

```
npm install @feathersjs/socketio-client socket.io-client --save
```

The `@feathersjs/socketio-client` module allows to connect to services exposed through the [Socket.io transport](../socketio) via a Socket.io socket. We recommend using Feathers and the `@feathersjs/socketio-client` module on the client if possible since it can also handle reconnection and reauthentication. If however, you want to use a direct Socket.io connection without using Feathers on the client, see the [Direct connection](#direct-connection) section.

::warning[Important]
Socket.io is also used to _call_ service methods. Using sockets for both calling methods and receiving real-time events is generally faster than using [REST](./rest). There is therefore no need to use both REST and Socket.io in the same client application.
::

### socketio(socket)

Initialize the Socket.io client using a given socket and the default options.

```ts
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'

const socket = io('http://api.feathersjs.com')
const app = feathers()

// Set up Socket.io client with the socket
app.configure(socketio(socket))

// Receive real-time events through Socket.io
app.service('messages').on('created', (message) => console.log('New message created', message))

// Call the `messages` service
app.service('messages').create({
  text: 'A message from a REST client'
})
```

### `app.io`

`app.io` contains a reference to the `socket` object passed to `socketio(socket [, options])`

```ts
app.io.on('disconnect', (reason: any) => {
  // Show offline message
})
```

### Custom Methods

On the client, [custom service methods](../services#custom-methods) are also registered using the `methods` option when registering the service via `socketClient.service()`:

```ts
import { feathers } from '@feathersjs/feathers'
import type { Params } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import type { SocketService } from '@feathersjs/socketio-client'
import io from 'socket.io-client'

// `data` and return type of custom method
type CustomMethodData = { name: string }
type CustomMethodResponse = { acknowledged: boolean }

type ServiceTypes = {
  // The type is a Socket service extended with custom methods
  myservice: SocketService & {
    myCustomMethod(data: CustomMethodData, params: Params): Promise<CustomMethodResponse>
  }
}

const socket = io('http://api.feathersjs.com')
const client = feathers<ServiceTypes>()
const socketClient = socketio(socket)

// Set up Socket.io client with the socket
client.configure(socketClient)

// Register a socket client service with all methods listed
client.use('myservice', socketClient.service('myservice'), {
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'myCustomMethod']
})

// Then it can be used like other service methods
client.service('myservice').myCustomMethod(data, params)
```

::note
Just like on the server _all_ methods you want to use have to be listed in the `methods` option.
::

### Route placeholders

Service URLs can have placeholders, e.g. `users/:userId/messages`. (see in [express](../express#params.route) or [koa](../koa#params.route))

You can call the client with route placeholders in the `params.route` property:

```ts
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'

const socket = io('http://api.feathersjs.com')
const app = feathers()

// Set up Socket.io client with the socket
app.configure(socketio(socket))

// Call `users/2/messages`
app.service('users/:userId/messages').find({
  route: {
    userId: 2
  }
})
```

This can also be achieved by using the client bundled,
sharing several `servicePath` variable exported in the [service shared file](../../guides/cli/service.shared#Variables) file.

```ts
import rest from '@feathersjs/rest-client'

const connection = rest('https://myapp.com').fetch(window.fetch.bind(window))

const client = createClient(connection)

// Call the `https://myapp.com/users/2/messages` URL
client.service(usersMyMessagesPath).find({
  route: {
    userId: 2
  }
})

import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'
import { createClient, usersMessagesPath } from 'my-app'

const socket = io('http://api.my-feathers-server.com')
const connection = socketio(socket)

const client = createClient(connection)

const messageService = client.service('users/:userId/messages')

// Call `users/2/messages`
app.service('users/:userId/messages').find({
  route: {
    userId: 2
  }
})
```

## Direct connection

Feathers sets up a normal Socket.io server that you can connect to with any Socket.io compatible client, usually the [Socket.io client](http://socket.io/docs/client-api/) either by loading the `socket.io-client` module or `/socket.io/socket.io.js` from the server. Query parameter types do not have to be converted from strings as they do for REST requests.

::warning[Important]
The socket connection URL has to point to the server root which is where Feathers will set up Socket.io.
::

```html
<!-- Connecting to the same URL -->
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io()
</script>

<!-- Connecting to a different server -->
<script src="http://localhost:3030/socket.io/socket.io.js"></script>
<script>
  var socket = io('http://localhost:3030/')
</script>
```

Service methods can be called by emitting a `<methodname>` event followed by the service path and method parameters. The service path is the name the service has been registered with (in `app.use`), without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Socket.io middleware](../socketio).

If the service path or method does not exist, an appropriate Feathers error will be returned.

### Authentication

There are two ways to establish an authenticated Socket.io connection. Either by calling the authentication service or by sending authentication headers.

#### Via authentication service

Sockets will be authenticated automatically by calling [.create](#create) on the [authentication service](../authentication/service):

```ts
import io from 'socket.io-client'

const socket = io('http://localhost:3030')

socket.emit(
  'create',
  'authentication',
  {
    strategy: 'local',
    email: 'hello@feathersjs.com',
    password: 'supersecret'
  },
  function (error, authResult) {
    console.log(authResult)
    // authResult will be {"accessToken": "your token", "user": user }
    // You can now send authenticated messages to the server
  }
)
```

::warning[Important]
When a socket disconnects and then reconnects, it has to be authenticated again before making any other request that requires authentication. This is usually done with the [jwt strategy](../authentication/jwt) using the `accessToken` from the `authResult`. The [authentication client](../authentication/client) handles this already automatically.
::

```js
socket.on('connect', () => {
  socket.emit(
    'create',
    'authentication',
    {
      strategy: 'jwt',
      accessToken: authResult.accessToken
    },
    function (error, newAuthResult) {
      console.log(newAuthResult)
    }
  )
})
```

#### Via handshake headers

If the authentication strategy (e.g. JWT or API key) supports parsing headers, an authenticated websocket connection can be established by adding the information in the [extraHeaders option](https://socket.io/docs/client-api/#With-extraHeaders):

```ts
import io from 'socket.io-client'

const socket = io('http://localhost:3030', {
  extraHeaders: {
    Authorization: `Bearer <accessToken here>`
  }
})
```

::note[Note]
The authentication strategy needs to be included in the [`authStrategies` configuration](../authentication/service#configuration).
::

### find

Retrieves a list of all matching resources from the service

```js
socket.emit('find', 'messages', { status: 'read', user: 10 }, (error, data) => {
  console.log('Found all messages', data)
})
```

Will call `app.service('messages').find({ query: { status: 'read', user: 10 } })` on the server.

### get

Retrieve a single resource from the service.

```js
socket.emit('get', 'messages', 1, (error, message) => {
  console.log('Found message', message)
})
```

Will call `app.service('messages').get(1, {})` on the server.

```js
socket.emit('get', 'messages', 1, { status: 'read' }, (error, message) => {
  console.log('Found message', message)
})
```

Will call `app.service('messages').get(1, { query: { status: 'read' } })` on the server.

### create

Create a new resource with `data` which may also be an array.

```js
socket.emit(
  'create',
  'messages',
  {
    text: 'I really have to iron'
  },
  (error, message) => {
    console.log('Todo created', message)
  }
)
```

Will call `app.service('messages').create({ text: 'I really have to iron' }, {})` on the server.

```js
socket.emit('create', 'messages', [{ text: 'I really have to iron' }, { text: 'Do laundry' }])
```

Will call `app.service('messages').create` with the array.

### update

Completely replace a single or multiple resources.

```js
socket.emit(
  'update',
  'messages',
  2,
  {
    text: 'I really have to do laundry'
  },
  (error, message) => {
    console.log('Todo updated', message)
  }
)
```

Will call `app.service('messages').update(2, { text: 'I really have to do laundry' }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.emit(
  'update',
  'messages',
  null,
  {
    status: 'unread'
  },
  { status: 'read' }
)
```

Will call `app.service('messages').update(null, { status: 'read' }, { query: { satus: 'unread' } })` on the server.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```js
socket.emit(
  'patch',
  'messages',
  2,
  {
    read: true
  },
  (error, message) => {
    console.log('Patched message', message)
  }
)
```

Will call `app.service('messages').patch(2, { read: true }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.emit(
  'patch',
  'messages',
  null,
  {
    status: 'read'
  },
  {
    status: 'unread'
  },
  (error, message) => {
    console.log('Patched message', message)
  }
)
```

Will call `app.service('messages').patch(null, { status: 'read' }, { query: { status: 'unread' } })` on the server, to change the status for all read app.service('messages').

### remove

Remove a single or multiple resources:

```js
socket.emit('remove', 'messages', 2, {}, (error, message) => {
  console.log('Removed a message', message)
})
```

Will call `app.service('messages').remove(2, {})` on the server. The `id` can also be `null` to remove multiple resources:

```js
socket.emit('remove', 'messages', null, { status: 'archived' })
```

Will call `app.service('messages').remove(null, { query: { status: 'archived' } })` on the server to delete all messages with status `archived`.

### Custom methods

[Custom service methods](../services#custom-methods) can be called directly via Socket.io by sending a `socket.emit(methodName, serviceName, data, query)` message:

```js
socket.emit('myCustomMethod', 'myservice', { message: 'Hello world' }, {}, (error, data) => {
  console.log('Called myCustomMethod', data)
})
```

### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](../events) are sent to the socket in the form of `servicepath eventname`.

#### created

The `created` event will be published with the callback data, when a service `create` returns successfully.

```ts
const socket = io('http://localhost:3030/')

socket.on('messages created', (message: Message) => {
  console.log('Got a new Todo!', message)
})
```

#### updated, patched

The `updated` and `patched` events will be published with the callback data, when a service `update` or `patch` method calls back successfully.

```ts
const socket = io('http://localhost:3030/')

socket.on('my/messages updated', (message: Message) => {
  console.log('Got an updated Todo!', message)
})

socket.emit(
  'update',
  'my/messages',
  1,
  {
    text: 'Updated text'
  },
  {},
  (error, callback) => {
    // Do something here
  }
)
```

#### removed

The `removed` event will be published with the callback data, when a service `remove` calls back successfully.

```js
const socket = io('http://localhost:3030/')

socket.on('messages removed', (message: Message) => {
  // Remove element showing the Todo from the page
  $('#message-' + message.id).remove()
})
```

#### Custom events

[Custom events](../events#custom-events) can be listened to accordingly:

```ts
const socket = io('http://localhost:3030/')

socket.on('messages myevent', function (data: any) {
  console.log('Got myevent event', data)
})
```
