---
outline: deep
---

# Events

Events are the key part of Feathers real-time functionality. All events in Feathers are provided through the [NodeJS EventEmitter](https://nodejs.org/api/events.html) interface. This section describes

- A quick overview of the [NodeJS EventEmitter interface](#eventemitters)
- The standard [service events](#service-events)
- How to allow sending [custom events](#custom-events) from the server to the client

<BlockQuote type="warning" label="Important">

For more information on how to safely send real-time events to clients, see the [Channels chapter](./channels.md).

</BlockQuote>

## EventEmitters

Once registered, any [service](./services.md) gets turned into a standard [NodeJS EventEmitter](https://nodejs.org/api/events.html) and can be used accordingly.

```ts
const messages = app.service('messages')

// Listen to a normal service event
messages.on('patched', (message: Message) => console.log('message patched', message))

// Only listen to an event once
messsages.once('removed', (message: Message) =>
  console.log('First time a message has been removed', message)
)

// A reference to a handler
const onCreatedListener = (message: Message) => console.log('New message created', message)

// Listen `created` with a handler reference
messages.on('created', onCreatedListener);

// Unbind the `created` event listener
messages.removeListener('created', onCreatedListener)

// Send a custom event
messages.emit('customEvent', {
  anything: 'Data can be anything'
})
```

## Service Events

Any service automatically emits `created`, `updated`, `patched` and `removed` events when the respective service method returns successfully. This works on the client as well as on the server. When the client is using [Socket.io](socketio.md), events will be pushed automatically from the server to all connected clients. This is how Feathers does real-time.

<BlockQuote type="tip">

Events are not fired until all of your [hooks](./hooks.md) have executed.

</BlockQuote>

Additionally to the event `data`, all events also get the [hook context](./hooks.md) from their method call passed as the second parameter.

### created

The `created` event will fire with the result data when a service `create` returns successfully.

```ts
import { feathers, type Params, type HookContext } from '@feathersjs/feathers'

const app = feathers()

type Message = { text: string }

app.use('messages', {
  async create(data: Message, params: Params) {
    return data
  }
});

// Retrieve the wrapped service object which is also an EventEmitter
const messages = app.service('messages')

messages.on('created', (message: Message, contexHookContext) => console.log('created', message))

messages.create({
  text: 'We have to do something!'
})
```

### updated, patched

The `updated` and `patched` events will fire with the callback data when a service `update` or `patch` method calls back successfully.

```ts
import { feathers, type Id, type Params, type HookContext } from '@feathersjs/feathers'

const app = feathers()

type Message = { text: string }

const app = feathers()

app.use('my/messages/', {
  async update(id: Id, data: Message) {
    return data
  },

  async patch(id: Id, data: Message) {
    return data
  }
})

const messages = app.service('my/messages')

messages.on('updated', (message: Message, context: HookContext) => console.log('updated', message))
messages.on('patched', (message: Message) => console.log('patched', message))

messages.update(0, {
  text: 'updated message'
})

messages.patch(0, {
  text: 'patched message'
})
```

### removed

The `removed` event will fire with the callback data when a service `remove` calls back successfully.

```ts
import { feathers, type Id, type Params, type HookContext } from '@feathersjs/feathers'

const app = feathers()

app.use('messages', {
  async remove(id: Id, params: Params) {
    return { id }
  }
});

const messages = app.service('messages')

messages.on('removed', (message: Message, context: HookContext) => console.log('removed', message))
messages.remove(1);
```

## Custom events

By default, real-time clients will only receive the [standard events](#service-events). However, it is possible to define a list of custom events when registering the service with [app.use](./application.md#usepath-service--options) that should also be sent to the client when `service.emit('customevent', data)` is called on the server. The `context` for custom events won't be a full hook context but just an object containing `{ app, service, path, result }`.

<BlockQuote type="warning">

Custom events can only be sent from the server to the client, not the other way (client to server). A [custom service](./services.md) should be used for those cases.

</BlockQuote>

For example, a payment service that sends status events to the client while processing a payment could look like this:

```ts
class PaymentService {
  async create(data: any, params: Params) {
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

```ts
import { MongoDbService } from '@feathersjs/mongodb'

app.use('payments', new MongoDbService({
  events: [ 'status' ],
  Model
}))
```

Using `service.emit` custom events can also be sent in a hook:

```js
app.service('payments').hooks({
  after: {
    create(context: HookContext) {
      context.service.emit('status', { status: 'completed' });
    }
  }
});
```


Custom events can be [published through channels](./channels.md#publishing) just like standard events and listened to it in a [Feathers client](./client.md) or [directly on the socket connection](./client/socketio.md#listening-to-events):


```js
client.service('payments').on('status', data => {});

// or
socket.on('payments status', data => {});
```
