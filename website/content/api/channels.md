# Channels

On a Feathers server with a real-time transport (like [SSE](./client/sse)) configured, event channels determine which connected clients to send [real-time events](./events) to and how the sent data should look.

This chapter describes:

- [Concepts](#concepts) of real-time communication
- [An example](#example) channels.js file
- [Real-time Connections](#connections) and how to access them
- [Channel usage](#channels) and how to retrieve, join and leave channels
- [Publishing events](#publishing) to channels

::note[Important]
Channels functionality will not be available in the following two scenarios:

- When you're making an HTTP-only API, not using a real-time adapter.
- When you're using Feathers on the client. Only server-side Feathers has channel management.
::

Here are some example logic conditions where channels are useful:

- Real-time events should only be sent to authenticated users
- Users should only get updates about messages from chat rooms they joined
- Only users in the same organization should receive real-time updates about their data changes
- Only admins should be notified when new users are created
- When a user is created, modified or removed, non-admins should only receive a "safe" version of the user object (e.g. only `email`, `id` and `avatar`)

## Concepts

A **_channel_** is basically an array of **_connection_** objects. Each array is explicitly given a name. When using a real-time server transport and a new client connects, you can tell the server to explicitly add that client's connection object to any relevant channels. Any connection in a channel will receive all events that are sent to that channel. This allows clients to receive only their intended messages.

When using a real-time transport, the server pushes events (such as "created", "removed" etc. for a particular service) down to its clients. Using channels allows customizing which clients should receive each event. The client doesn’t subscribe to individual channels, directly, but rather subscribes to specific events like `created`, `patched`, custom events, etc, in which they are interested. Those events will only fire for a client if the server pushes data to one a channel to which the client has been added.

You can have any number of channels. This helps to organise how data is sent and to control the volume of data, by not sending things that aren't relevant.

The server can also change connection channel membership from time to time, e.g. when user data is updated.

The server needs to explicitly **publish** channels it is interested in sharing with clients before they become available.

## Example

The example below shows a `channels.ts` file illustrating how the different parts fit together. When using [SSE](./client/sse), the connection's `params` are set by the hooks of the SSE service `find` method. This means you can use an [authentication hook](./authentication) to set `params.user` before the connection is established:

```ts
import type { RealTimeConnection } from 'feathers'
import type { HookContext } from './declarations'

export default function (app: any) {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  app.on('connection', (connection: RealTimeConnection) => {
    // When using an authentication hook on the SSE service,
    // connection.user will already be set
    if (connection.user) {
      app.channel('authenticated').join(connection)
    } else {
      app.channel('anonymous').join(connection)
    }
  })

  // Publish all service events to all authenticated users
  app.publish((data: any, context: HookContext) => {
    return app.channel('authenticated')
  })
}
```

## Connections

A connection is an object that represents a real-time connection. It contains the `params` from the SSE service `find` method call that established the connection. When using an [authentication hook](./authentication), `connection.user` will contain the authenticated user.

::note[Note]
When a connection is terminated it will be automatically removed from all channels.
::

### app.on('connection')

`app.on('connection', connection => {})` is fired every time a new real-time connection is established. The `connection` object contains the `params` from the SSE service `find` method, including `user` if an authentication hook was used. This is the place to add connections to the appropriate channels:

```ts
import type { RealTimeConnection } from 'feathers'

app.on('connection', (connection: RealTimeConnection) => {
  if (connection.user) {
    // Add authenticated connections to the authenticated channel
    app.channel('authenticated').join(connection)

    // Channels can be named anything and joined on any condition
    // E.g. to send real-time events only to admins use
    if (connection.user.isAdmin) {
      app.channel('admins').join(connection)
    }

    // If the user has joined e.g. chat rooms
    connection.user.rooms.forEach((room) => {
      app.channel(`rooms/${room.id}`).join(connection)
    })
  } else {
    // Add unauthenticated connections to the anonymous channel
    app.channel('anonymous').join(connection)
  }
})
```

### app.on('disconnect')

`app.on('disconnect', connection => {})` is fired every time a real-time connection is disconnected. This is a good place to handle disconnections. A connection that is disconnected will always leave all its channels automatically.

## Channels

A channel is an object that contains a number of connections. It can be created via `app.channel` and allows a connection to join or leave it.

### app.channel(...names)

`app.channel(name) -> Channel`, when given a single name, returns an existing or new named channel:

```ts
app.channel('admins') // the admin channel
app.channel('authenticated') // the authenticated channel
```

`app.channel(name1, name2, ... nameN) -> Channel`, when given multiples names, will return a combined channel. A combined channel contains a list of all connections (without duplicates) and re-directs `channel.join` and `channel.leave` calls to all its child channels.

```ts
// Combine the anonymous and authenticated channel
const combinedChannel = app.channel('anonymous', 'authenticated')

// Join the `anonymous` and `authenticated` channel
combinedChannel.join(connection)

// Join the `admins` and `chat` channel
app.channel('admins', 'chat').join(connection)

// Leave the `admins` and `chat` channel
app.channel('admins', 'chat').leave(connection)

// Make user with `_id` 5 leave the admins and chat channel
app.channel('admins', 'chat').leave((connection) => {
  return connection.user._id === 5
})
```

### app.channels

`app.channels -> [string]` returns a list of all existing channel names.

```ts
app.channel('authenticated')
app.channel('admins', 'users')

app.channels // [ 'authenticated', 'admins', 'users' ]

app.channel(app.channels) // will return a channel with all connections
```

This is useful to e.g. remove a connection from all channels:

```ts
import type { RealTimeConnection } from 'feathers'

// When a user is removed, make all their connections leave every channel
app.service('users').on('removed', (user: User) => {
  app.channel(app.channels).leave((connection: RealTimeConnection) => {
    return user._id === connection.user._id
  })
})
```

### channel.join(connection)

`channel.join(connection) -> Channel` adds a connection to this channel. If the channel is a combined channel, add the connection to all its child channels. If the connection is already in the channel it does nothing. Returns the channel object.

```ts
import type { RealTimeConnection } from 'feathers'

app.on('connection', (connection: RealTimeConnection) => {
  if (connection.user?.isAdmin) {
    // Join the admins channel
    app.channel('admins').join(connection)

    // Calling a second time will do nothing
    app.channel('admins').join(connection)
  }
})
```

### channel.leave(connection|fn)

`channel.leave(connection|fn) -> Channel` removes a connection from this channel. If the channel is a combined channel, remove the connection from all its child channels. Also allows to pass a callback that is run for every connection and returns if the connection should be removed or not. Returns the channel object.

```ts
import type { RealTimeConnection } from 'feathers'

// Make the user with `_id` 5 leave the `admins` channel
app.channel('admins').leave((connection: RealTimeConnection) => {
  return connection.user._id === 5
})
```

### channel.filter(fn)

`channel.filter(fn) -> Channel` returns a new channel filtered by a given function which gets passed the connection.

```ts
import type { RealTimeConnection } from 'feathers'

// Returns a new channel with all connections of the user with `_id` 5
const userFive = app
  .channel(app.channels)
  .filter((connection: RealTimeConnection) => connection.user._id === 5)
```

### channel.send(data)

`channel.send(data) -> Channel` returns a copy of this channel with customized data that should be sent for this event. Usually this should be handled by modifying either the service method result or setting client "safe" data in `context.dispatch` but in some cases it might make sense to still change the event data for certain channels.

What data will be sent as the event data will be determined by the first available in the following order:

1. `data` from `channel.send(data)`
2. `context.dispatch`
3. `context.result`

```ts
import type { RealTimeConnection } from 'feathers'

app.on('connection', (connection: RealTimeConnection) => {
  // On a new real-time connection, add it to the
  // anonymous channel
  app.channel('anonymous').join(connection)
})

// Send the `users` `created` event to all anonymous
// users but use only the name as the payload
app.service('users').publish('created', (data: User) => {
  return app.channel('anonymous').send({
    name: data.name
  })
})
```

::warning[Important]
If a connection is in multiple channels (e.g. `users` and `admins`) it will get the data from the _first_ channel that it is in.
::

### channel.connections

`channel.connections -> [ object ]` contains a list of all connections in this channel.

### channel.length

`channel.length -> integer` returns the total number of connections in this channel.

## Publishing

Publishers are callback functions that return which channel(s) to send an event to. They can be registered at the application and the service level and for all or specific events. A publishing function gets the event data and context object (`(data, context) => {}`) and returns a named or combined channel, an array of channels or `null`. Only one publisher can be registered for one type. Besides the standard [service event names](./events#service-events) an event name can also be a [custom event](./events#custom-events). `context` is the [hook context object](./hooks) from the service call or an object containing `{ path, service, app, result }` for custom events.

### service.publish([event,] fn)

`service.publish([event,] fn) -> service` registers a publishing function for a specific service for a specific event or all events if no event name was given.

```ts
import type { HookContext } from './declarations'

// Publish all messages service events only to its room channel
app.service('messages').publish((data: Message, context: HookContext) => {
  return app.channel(`rooms/${data.roomId}`)
})

// Publish the `created` event to admins and the user that sent it
app.service('users').publish('created', (data: User, context: HookContext) => {
  return [
    app.channel('admins'),
    app.channel(app.channels).filter((connection) => connection.user._id === context.params.user._id)
  ]
})

// Prevent all events in the `password-reset` service from being published
app.service('password-reset').publish(() => null)
```

### app.publish([event,] fn)

`app.publish([event,] fn) -> app` registers a publishing function for all services for a specific event or all events if no event name was given.

```ts
// Publish all events to all authenticated users
app.publish((data: any, context: HookContext) => {
  return app.channel('authenticated')
})

// Publish the `log` custom event to all connections
app.publish('log', (data: any, context: HookContext) => {
  return app.channel(app.channels)
})
```

### Publisher precedence

The first publisher callback found in the following order will be used:

1. Service publisher for a specific event
2. Service publisher for all events
3. App publishers for a specific event
4. App publishers for all events

## Keeping channels updated

Since every application will be different, keeping the connections assigned to channels up to date (e.g. if a user joins/leaves a room) is up to you.

In general, channels should reflect your persistent application data. This means that it normally isn't necessary for e.g. a user to request to directly join a channel. This is especially important when running multiple instances of an application since channels are only _local_ to the current instance.

Instead, the relevant information (e.g. what rooms a user is currently in) should be stored in the database and then the active connections can be re-distributed into the appropriate channels listening to the proper [service events](./events).

The following example updates all active connections for a given user when the user object (which is assumed to have a `rooms` array being a list of room ids the user has joined) is updated or removed:

```ts
import type { RealTimeConnection } from 'feathers'

// Join a channel given a user and connection
const joinChannels = (user: User, connection: RealTimeConnection) => {
  app.channel('authenticated').join(connection)
  // Assuming that the chat room/user assignment is stored
  // on an array of the user
  user.rooms.forEach((room) => app.channel(`rooms/${room.id}`).join(connection))
}

// Get a user to leave all channels
const leaveChannels = (user: User) => {
  app.channel(app.channels).leave((connection) => connection.user._id === user._id)
}

// Leave and re-join all channels with new user information
const updateChannels = (user: User) => {
  // Find all connections for this user
  const { connections } = app.channel(app.channels).filter((connection) => connection.user._id === user._id)

  // Leave all channels
  leaveChannels(user)

  // Re-join all channels with the updated user information
  connections.forEach((connection) => joinChannels(user, connection))
}

app.on('connection', (connection: RealTimeConnection) => {
  if (connection.user) {
    // Join all channels on connection
    joinChannels(connection.user, connection)
  }
})

// On `updated` and `patched`, leave and re-join with new room assignments
app.service('users').on('updated', updateChannels)
app.service('users').on('patched', updateChannels)
// On `removed`, remove the connection from all channels
app.service('users').on('removed', leaveChannels)
```

::note[Note]
The number of active connections is usually one (or none) but unless you prevent it explicitly Feathers does not prevent multiple connections from the same user (e.g. with two open browser windows or on a mobile device).
::
