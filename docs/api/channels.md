# Channels

On a Feathers server with a real-time transport (like [Socket.io](./socketio.md)) set up, event channels determine which connected clients to send [real-time events](./events.md) to and how the sent data should look like.

This chapter describes:

- [Real-time Connections](#connections) and how to access them
- [Channel usage](#channels) and how to retrieve, join and leave channels
- [Publishing events](#publishing) to channels

> __Important:__ If you are not using a real-time transport server (e.g. when making a REST only API or using Feathers on the client), channel functionality is not going to be available.

Some examples where channels are used:

- Real-time events should only be sent to authenticated users
- Users should only get updates about messages if they joined a certain chat room
- Only users in the same organization should receive real-time updates about their data changes
- Only admins should be notified when new users are created
- When a user is created, modified or removed, non-admins should only receive a "safe" version of the user object (e.g. only `email`, `id` and `avatar`)

## Concepts

When using channels, the server pushes events (such as "created", "removed" etc. for a particular service) down to its clients via *channels*. The client doesn’t listen to individual channels directly, but rather subscribes to specific events on services that it is interested in. Those events will only fire on the client if the server pushes data to one or more channels that the client has been added to.

You can have any number of channels. This helps to organise how data is sent and to control the volume of data, by not sending things that aren't relevant. 

When a new client connects, the server explicitly adds that *connection* to any relevant channels. This is how clients are given access to events that they are allowed to see.

The server can also change connection channel membership from time to time, eg before vs after login.

The server needs to explicitly *publish* channels it is interested in sharing with clients before they become available.

## Example

The example below shows the generated `channels.js` file illustrating how the different parts fit together:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
module.exports = function(app) {
  if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', connection => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (authResult, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if(connection) {
      // Obtain the logged in user from the connection
      // const user = connection.user;
      
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);

      // Channels can be named anything and joined on any condition 
      
      // E.g. to send real-time events only to admins use
      // if(user.isAdmin) { app.channel('admins').join(connection); }

      // If the user has joined e.g. chat rooms
      // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(connection));
      
      // Easily organize users by email and userid for things like messaging
      // app.channel(`emails/${user.email}`).join(connection);
      // app.channel(`userIds/${user.id}`).join(connection);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.publish((data, hook) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    console.log('Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.'); // eslint-disable-line

    // e.g. to publish all service events to all authenticated users use
    return app.channel('authenticated');
  });

  // Here you can also add service specific event publishers
  // e.g. the publish the `users` service `created` event to the `admins` channel
  // app.service('users').publish('created', () => app.channel('admins'));
  
  // With the userid and email organization from above you can easily select involved users
  // app.service('messages').publish(data => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ];
  // });
};
```
:::

::: tab "TypeScript"
```ts
export default function(app: any) {
  if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (authResult: any, { connection }: any) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if(connection) {
      // Obtain the logged in user from the connection
      // const user = connection.user;
      
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);

      // Channels can be named anything and joined on any condition 
      
      // E.g. to send real-time events only to admins use
      // if(user.isAdmin) { app.channel('admins').join(connection); }

      // If the user has joined e.g. chat rooms
      // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(connection));
      
      // Easily organize users by email and userid for things like messaging
      // app.channel(`emails/${user.email}`).join(connection);
      // app.channel(`userIds/${user.id}`).join(connection);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.publish((data: any, hook: any) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    console.log('Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.'); // eslint-disable-line

    // e.g. to publish all service events to all authenticated users use
    return app.channel('authenticated');
  });

  // Here you can also add service specific event publishers
  // e.g. the publish the `users` service `created` event to the `admins` channel
  // app.service('users').publish('created', () => app.channel('admins'));
  
  // With the userid and email organization from above you can easily select involved users
  // app.service('messages').publish(data => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ];
  // });
};
```
:::

::::

## Connections

A connection is an object that represents a real-time connection. It is the same object as `socket.feathers` in a [Socket.io](./socketio.md) middleware. You can add any kind of information to it but most notably, when using [authentication](./authentication/service.md), it will contain the authenticated user. By default it is located in `connection.user` once the client has authenticated on the socket (usually by calling `app.authenticate()` on the [client](./client.md)).

We can get access to the `connection` object by listening to `app.on('connection', connection => {})` or `app.on('login', (payload, { connection }) => {})`.

> __Note:__ When a connection is terminated it will be automatically removed from all channels.

### app.on('connection')

`app.on('connection', connection => {})` is fired every time a new real-time connection is established. This is a good place to add the connection to a channel for anonymous users (in case we want to send any real-time updates to them):

```js
app.on('connection', connection => {
  // On a new real-time connection, add it to the
  // anonymous channel
  app.channel('anonymous').join(connection);
});
```

### app.on('disconnect')

`app.on('disconnect', connection => {})` is fired every time real-time connection is disconnected. This is a good place to to handle disconnections outside of a logout. A connection that is disconnected will always leave all its channels automatically.

### app.on('login')

`app.on('login', (authResult, params, context) => {})` is sent by the [AuthenticationService](./authentication/service.md#app-on-login) on successful login.

This is a good place to add the connection to channels related to the user (e.g. chat rooms, admin status etc.)

```js
app.on('login', (payload, { connection }) => {
  // connection can be undefined if there is no
  // real-time connection, e.g. when logging in via REST
  if(connection) {
    // The user attached to this connection
    const { user } = connection;

    // The connection is no longer anonymous, remove it
    app.channel('anonymous').leave(connection);

    // Add it to the authenticated user channel
    app.channel('authenticated').join(connection);

    // Channels can be named anything and joined on any condition `
    // E.g. to send real-time events only to admins use
    if(user.isAdmin) {
      app.channel('admins').join(connection);
    }

    // If the user has joined e.g. chat rooms
    user.rooms.forEach(room => {
      app.channel(`rooms/${room.id}`).join(connection);
    });
  }
});
```

### app.on('logout')

`app.on('logout', (authResult, params, context) => {})` is sent by the [AuthenticationService](./authentication/service.md) on successful logout:

```js
app.on('logout', (payload, { connection }) => {
  if(connection) {
    // Join the channels a logged out connection should be in
    app.channel('anonymous').join(connection);
  }
});
```

> __Note:__ On `logout` the connection will be removed from all existing channels automatically.

## Channels

A channel is an object that contains a number of connections. It can be created via `app.channel` and allows a connection to join or leave it.

### app.channel(...names)

`app.channel(name) -> Channel`, when given a single name, returns an existing or new named channel:

```js
app.channel('admins') // the admin channel
app.channel('authenticated') // the authenticated channel
```

`app.channel(name1, name2, ... nameN) -> Channel`, when given multiples names, will return a combined channel. A combined channel contains a list of all connections (without duplicates) and re-directs `channel.join` and `channel.leave` calls to all its child channels.

```js
// Combine the anonymous and authenticated channel
const combinedChannel = app.channel('anonymous', 'authenticated')

// Join the `anonymous` and `authenticated` channel
combinedChannel.join(connection);

// Join the `admins` and `chat` channel
app.channel('admins', 'chat').join(connection);

// Leave the `admins` and `chat` channel
app.channel('admins', 'chat').leave(connection);

// Make user with `_id` 5 leave the admins and chat channel
app.channel('admins', 'chat').leave(connection => {
  return connection.user._id === 5;
});
```

### app.channels

`app.channels -> [string]` returns a list of all existing channel names.

```js
app.channel('authenticated');
app.channel('admins', 'users');

app.channels // [ 'authenticated', 'admins', 'users' ]

app.channel(app.channels) // will return a channel with all connections
```

This is useful to e.g. remove a connection from all channels:

```js
// When a user is removed, make all their connections leave every channel
app.service('users').on('removed', user => {
  app.channel(app.channels).leave(connection => {
    return user._id === connection.user._id;
  });
});
```

### channel.join(connection)

`channel.join(connection) -> Channel` adds a connection to this channel. If the channel is a combined channel, add the connection to all its child channels. If the connection is already in the channel it does nothing. Returns the channel object.

```js
app.on('login', (payload, { connection }) => {
  if(connection && connection.user.isAdmin) {
    // Join the admins channel
    app.channel('admins').join(connection);

    // Calling a second time will do nothing
    app.channel('admins').join(connection);
  }
});
```

### channel.leave(connection|fn)

`channel.leave(connection|fn) -> Channel` removes a connection from this channel. If the channel is a combined channel, remove the connection from all its child channels. Also allows to pass a callback that is run for every connection and returns if the connection should be removed or not. Returns the channel object.

```js
// Make the user with `_id` 5 leave the `admins` channel
app.channel('admins').leave(connection => {
  return connection.user._id === 5;
});
```

### channel.filter(fn)

`channel.filter(fn) -> Channel` returns a new channel filtered by a given function which gets passed the connection.

```js
// Returns a new channel with all connections of the user with `_id` 5
const userFive = app.channel(app.channels)
  .filter(connection => connection.user._id === 5);
```

### channel.send(data)

`channel.send(data) -> Channel` returns a copy of this channel with customized data that should be sent for this event. Usually this should be handled by modifying either the service method result or setting client "safe" data in `context.dispatch` but in some cases it might make sense to still change the event data for certain channels.

What data will be sent as the event data will be determined by the first available in the following order:

1. `data` from `channel.send(data)`
2. `context.dispatch`
3. `context.result`

```js
app.on('connection', connection => {
  // On a new real-time connection, add it to the
  // anonymous channel
  app.channel('anonymous').join(connection);
});

// Send the `users` `created` event to all anonymous
// users but use only the name as the payload
app.service('users').publish('created', data => {
  return app.channel('anonymous').send({
    name: data.name
  });
});
```

> __Note:__ If a connection is in multiple channels (e.g. `users` and `admins`) it will get the data from the _first_ channel that it is in.

### channel.connections

`channel.connections -> [ object ]` contains a list of all connections in this channel.

### channel.length

`channel.length -> integer` returns the total number of connections in this channel.

## Publishing

Publishers are callback functions that return which channel(s) to send an event to. They can be registered at the application and the service level and for all or specific events. A publishing function gets the event data and context object (`(data, context) => {}`) and returns a named or combined channel, an array of channels or `null`. Only one publisher can be registered for one type. Besides the standard [service event names](./events.md#service-events) an event name can also be a [custom event](./events.md#custom-events). `context` is the [context object](./hooks.md) from the service call or an object containing `{ path, service, app, result }` for custom events.

### service.publish([event,] fn)

`service.publish([event,] fn) -> service` registers a publishing function for a specific service for a specific event or all events if no event name was given.

```js
app.on('login', (payload, { connection }) => {
  // connection can be undefined if there is no
  // real-time connection, e.g. when logging in via REST
  if(connection && connection.user.isAdmin) {
    app.channel('admins').join(connection);
  }
});

// Publish all messages service events only to its room channel
app.service('messages').publish((data, context) => {
  return app.channel(`rooms/${data.roomId}`);
});

// Publish the `created` event to admins and the user that sent it
app.service('users').publish('created', (data, context) => {
  return [
    app.channel('admins'),
    app.channel(app.channels).filter(connection =>
      connection.user._id === context.params.user._id
    )
  ];
});

// Prevent all events in the `password-reset` service from being published
app.service('password-reset').publish(() => null);
```

### app.publish([event,] fn)

`app.publish([event,] fn) -> app` registers a publishing function for all services for a specific event or all events if no event name was given.

```js
app.on('login', (payload, { connection }) => {
  // connection can be undefined if there is no
  // real-time connection, e.g. when logging in via REST
  if(connection) {
    app.channel('authenticated').join(connection);
  }
});

// Publish all events to all authenticated users
app.publish((data, context) => {
  return app.channel('authenticated');
});

// Publish the `log` custom event to all connections
app.publish('log', (data, context) => {
  return app.channel(app.channels);
});
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

Instead, the relevant information (e.g. what rooms a user is currently in) should be stored in the database and then the active connections can be re-distributed into the appropriate channels listening to the proper [service events](./events.md).

The following example updates all active connections for a given user when the user object (which is assumed to have a `rooms` array being a list of room ids the user has joined) is updated or removed:

```js
// Join a channel given a user and connection
const joinChannels = (user, connection) => {
  app.channel('authenticated').join(connection);
  // Assuming that the chat room/user assignment is stored
  // on an array of the user
  user.rooms.forEach(room =>
    app.channel(`rooms/${roomId}`).join(connection)
  );
}

// Get a user to leave all channels
const leaveChannels = user => {
  app.channel(app.channels).leave(connection =>
    connection.user._id === user._id
  );
};

// Leave and re-join all channels with new user information
const updateChannels = user => {
  // Find all connections for this user
  const { connections } = app.channel(app.channels).filter(connection =>
    connection.user._id === user._id
  );

  // Leave all channels
  leaveChannels(user);

  // Re-join all channels with the updated user information
  connections.forEach(connection => joinChannels(user, connection));
}

app.on('login', (payload, { connection }) => {
  if(connection) {
    // Join all channels on login
    joinChannels(connection.user, connection);
  }
});

// On `updated` and `patched`, leave and re-join with new room assignments
app.service('users').on('updated', updateChannels);
app.service('users').on('patched', updateChannels);
// On `removed`, remove the connection from all channels
app.service('users').on('removed', leaveChannels);
```

> __Note:__ The number active connections is usually one (or none) but unless you prevent it explicitly Feathers is not preventing multiple logins of the same user (e.g. with two open browser windows or on a mobile device).
