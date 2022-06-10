# Events

Events are the key part of Feathers real-time functionality. All events in Feathers are provided through the [NodeJS EventEmitter](https://nodejs.org/api/events.html) interface. This section describes

- A quick overview of the [NodeJS EventEmitter interface](#eventemitters)
- The standard [service events](#service-events)
- How to allow sending [custom events](#custom-events) from the server to the client

> **Important:** For more information on how to send real-time events to clients, see the [Channels chapter](./channels.md).

## EventEmitters

Once registered, any [service](./services.md) gets turned into a standard [NodeJS EventEmitter](https://nodejs.org/api/events.html) and can be used accordingly.

```js
const messages = app.service('messages');

// Listen to a normal service event
messages.on('patched', message => console.log('message patched', message));

// Only listen to an event once
messsages.once('removed', message =>
  console.log('First time a message has been removed', message)
);

// A reference to a handler
const onCreatedListener = message => console.log('New message created', message);

// Listen `created` with a handler reference
messages.on('created', onCreatedListener);

// Unbind the `created` event listener
messages.removeListener('created', onCreatedListener);

// Send a custom event
messages.emit('customEvent', {
  type: 'customEvent',
  data: 'can be anything'
});
```

## Service Events

Any service automatically emits `created`, `updated`, `patched` and `removed` events when the respective service method returns successfully. This works on the client as well as on the server. When the client is using [Socket.io](socketio.md), events will be pushed automatically from the server to all connected clients. This is essentially how Feathers does real-time.

> **ProTip:** Events are not fired until all of your [hooks](./hooks.md) have executed.

<!-- -->

> **Important:** For information on how those events are published for real-time updates to connected clients, see the [channel chapter](./channels.md).

Additionally to the event `data`, all events also get the [hook context](./hooks.md) from their method call passed as the second parameter.

### created

The `created` event will fire with the result data when a service `create` returns successfully.

```js
const feathers = require('@feathersjs/feathers');
const app = feathers();

app.use('/messages', {
  create(data, params) {
    return Promise.resolve(data);
  }
});

// Retrieve the wrapped service object which will be an event emitter
const messages = app.service('messages');

messages.on('created', (message, context) => console.log('created', message));

messages.create({
  text: 'We have to do something!'
});
```

### updated, patched

The `updated` and `patched` events will fire with the callback data when a service `update` or `patch` method calls back successfully.

```js
const feathers = require('@feathersjs/feathers');
const app = feathers();

app.use('/my/messages/', {
  update(id, data) {
    return Promise.resolve(data);
  },

  patch(id, data) {
    return Promise.resolve(data);
  }
});

const messages = app.service('my/messages');

messages.on('updated', (message, context) => console.log('updated', message));
messages.on('patched', message => console.log('patched', message));

messages.update(0, {
  text: 'updated message'
});

messages.patch(0, {
  text: 'patched message'
});
```

### removed

The `removed` event will fire with the callback data when a service `remove` calls back successfully.

```js
const feathers = require('@feathersjs/feathers');
const app = feathers();

app.use('/messages', {
  remove(id, params) {
    return Promise.resolve({ id });
  }
});

const messages = app.service('messages');

messages.on('removed', (message, context) => console.log('removed', message));
messages.remove(1);
```

## Custom events

By default, real-time clients will only receive the [standard events](#service-events). However, it is possible to define a list of custom events when registering the service with [app.use](./application.md#usepath-service--options) that should also be sent to the client when `service.emit('customevent', data)` is called on the server. The `context` for custom events won't be a full hook context but just an object containing `{ app, service, path, result }`.

> **Important:** Custom events can only be sent from the server to the client, not the other way (client to server). [Learn more](../help/faq.md#how-do-i-create-custom-methods)

For example, a payment service that sends status events to the client while processing a payment could look like this:

```js
class PaymentService {
  async create(data, params) {
    const customer = await createStripeCustomer(params.user);

    this.emit('status', { status: 'created' });
    const payment = await createPayment(data);

    this.emit('status', { status: 'completed' });
    
    return payment;
  }
}

// Then register it like this:
app.use('payments', new PaymentService(), {
  events: ['status']
})
```

The [database adapters](./databases/common.md) also take a list of custom events as an [initialization option](./databases/common.md#serviceoptions):

```js
const service = require('feathers-<adaptername>'); // e.g. `feathers-mongodb`

app.use('/payments', service({
  events: [ 'status' ],
  Model
});
```

Using `service.emit` custom events can also be sent in a hook:

```js
app.service('payments').hooks({
  after: {
    create(context) {
      context.service.emit('status', { status: 'completed' });
    }
  }
});
```


Custom events can be [published through channels](./channels.md#publishing) just like standard events and listened to it in a [Feathers client](./client.md) or [directly on the socket connection](./client/socketio.md#listening-to-events):


```js
client.service('payments').on('status', data => {});

socket.on('payments status', data => {});
```
