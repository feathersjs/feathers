

# Services

Services are the heart of every Feathers application. Services are objects or instances of [classes](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) that implement [certain methods](#service-methods). Feathers itself will also add some [additional methods and functionality](#feathers-functionality) to its services.

## Service methods

Service methods are pre-defined [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) and [custom methods](#custom-methods) that your service provides or that have already been implemented by one of the [database adapters](./databases/common). Below is an example of a Feathers service as a class or object.

```ts
import { feathers } from '@feathersjs/feathers'
import type { Params, Id, NullableId } from '@feathersjs/feathers'

class MyServiceClass {
  async find(params: Params) {
    return []
  }
  async get(id: Id, params: Params) {}
  async create(data: any, params: Params) {}
  async update(id: NullableId, data: any, params: Params) {}
  async patch(id: NullableId, data: any, params: Params) {}
  async remove(id: NullableId, params: Params) {}
  async setup(app: Application, path: string) {}
  async teardown(app: Application, path: string) {}
}

const myServiceObject = {
  async find(params: Params) {
    return []
  },
  async get(id: Id, params: Params) {},
  async create(data: any, params: Params) {},
  async update(id: NullableId, data: any, params: Params) {},
  async patch(id: NullableId, data: any, params: Params) {},
  async remove(id: NullableId, params: Params) {},
  async setup(app: Application, path: string) {},
  async teardown(app: Application, path: string) {}
}

type ServiceTypes = {
  'my-service': MyServiceClass
  'my-service-object': typeof myServiceObject
}

const app = feathers<ServiceTypes>()

app.use('my-service', new MyServiceClass())
app.use('my-service-object', myServiceObject)
```

::danger
Always use the service returned by `app.service(path)` not the service object or class directly or you will not get any of the [Feathers service functionality](services#feathers-functionality)
::

::tip
Methods are optional and if a method is not implemented Feathers will automatically emit a `NotImplemented` error. At least one standard service method must be implemented to be considered a service. If you used `methods` option when registering the service via [app.use](./application#usepath-service--options), all methods listed must be available.
::

Service methods must use [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) or return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and have the following parameters:

- `id` — The identifier for the resource. A resource is the data identified by a unique id.
- `data` — The resource data.
- `params` - Additional parameters for the method call (see [params](#params))

Once registered, the service can be retrieved and used via [app.service()](./application#servicepath):

```js
const myService = app.service('my-service')

const items = await myService.find()

const item = await app.service('my-service').get(1)

console.log('.get(1)', item)
```

::note
Although probably the most common use case, a service does not necessarily have to connect to a database. A custom service can implement any functionality like talking to another API or send an email etc.
::

::warning[Important]
This section describes the general usage of service methods and how to implement them. They are already implemented by the official Feathers database adapters. For specifics on how to use the database adapters, see the [database adapters documentation](./databases/common).
::

### params

`params` contain additional information for the service method call. Some properties in `params` can be set by Feathers already. Commonly used are:

- `params.query` - the query parameters from the client, either passed as URL query parameters (see the [REST](./express) chapter) or through websockets (see [Socket.io](./socketio)).
- `params.provider` - The transport (`rest` or `socketio`) used for this service call. Will be `undefined` for internal calls from the server (unless passed explicitly).
- `params.authentication` - The authentication information to use for the [authentication service](./authentication/service)
- `params.user` - The authenticated user, either set by [Feathers authentication](./authentication/) or passed explicitly.
- `params.connection` - If the service call has been made by a real-time transport (e.g. through websockets), `params.connection` is the connection object that can be used with [channels](./channels).
- `params.headers` - The HTTP headers connected to this service call if available. This is either the headers of the REST call or the headers passed when initializing a websocket connection.

::warning[Important]
For external calls only `params.query` will be sent between the client and server. This is because other parameters in `params` on the server often contain security critical information (like `params.user` or `params.authentication`).
::

### .find(params)

`service.find(params) -> Promise` - Retrieves a list of all resources from the service. `params.query` can be used to filter and limit the returned data.

```ts
class MessageService {
  async find(params: Params) {
    return [
      {
        id: 1,
        text: 'Message 1'
      },
      {
        id: 2,
        text: 'Message 2'
      }
    ]
  }
}

app.use('messages', new MessageService())
```

::note
`find` does not have to return an array. It can also return an object. The database adapters already do this for [pagination](./databases/common#pagination).
::

### .get(id, params)

`service.get(id, params) -> Promise` - Retrieves a single resource with the given `id` from the service.

```ts
import type { Id, Params } from '@feathersjs/feathers'

class TodoService {
  async get(id: Id, params: Params) {
    return {
      id,
      text: `You have to do ${id}!`
    }
  }
}

app.use('todos', new TodoService())
```

### .create(data, params)

`service.create(data, params) -> Promise` - Creates a new resource with `data`. The method should return with the newly created data. `data` may also be an array.

A successful `create` method call emits the [`created` service event](./events#created) with the returned data or a separate event for every item if the returned data is an array.

```ts
import type { Id, Params } from '@feathersjs/feathers'

type Message = { text: string }

class MessageService {
  messages: Message[] = []

  async create(data: Message, params: Params) {
    this.messages.push(data)

    return data
  }
}

app.use('messages', new MessageService())
```

::warning[Important]
Note that `data` may also be an array. When using a [database adapters](./databases/adapters) the [`multi` option](./databases/common) has to be set to allow arrays.
::

### .update(id, data, params)

`service.update(id, data, params) -> Promise` - Replaces the resource identified by `id` with `data`. The method should return with the complete, updated resource data. `id` can also be `null` when updating multiple records.

A successful `update` method call emits the [`updated` service event](./events#updated-patched). If an array is returned, it will send an individual `updated` event for every item.

::note
The [database adapters](./databases/adapters) do not support completely replacing multiple entries.
::

### .patch(id, data, params)

`patch(id, data, params) -> Promise` - Merges the existing data of the resource identified by `id` with the new `data`. `id` can also be `null` indicating that multiple resources should be patched with `params.query` containing the query criteria.

A successful `patch` method call emits the [`patched` service event](./events#updated-patched) with the returned data. When an array is returned when patching mutiple items, it will send an individual `patched` event for every item in the array.

The method should return with the complete, updated resource data. Implement `patch` additionally (or instead of) `update` if you want to distinguish between partial and full updates and support the `PATCH` HTTP method.

::note
With [database adapters](./databases/adapters) the [`multi` option](./databases/common) has to be set explicitly to support patching multiple entries.
::

### .remove(id, params)

`service.remove(id, params) -> Promise` - Removes the resource with `id`. The method should return with the removed data. `id` can also be `null`, which indicates the deletion of multiple resources, with `params.query` containing the query criteria.

A successful `remove` method call emits the [`removed` service event](./events#removed) with the returned data or a separate event for every item if the returned data is an array.

::note
With [database adapters](./databases/adapters) the [`multi` option](./databases/common) has to be set explicitly to support removing multiple entries.
::

### .setup(app, path)

`service.setup(app, path) -> Promise` is a special method that initializes the service, passing an instance of the Feathers application and the path it has been registered on.

When calling [app.listen](application#listenport) or [app.setup](application#setupserver) all registered services `setup` methods will be called. If a service is registered afterwards, the `setup` method will be called immediately.

### .teardown(app, path)

`service.teardown(app, path) -> Promise` is a special method that shuts down the service, passing an instance of the Feathers application and the path it has been registered on. If a service implements a `teardown` method, it will be called during [app.teardown()](application#teardownserver) or when unregistering the service via [app.unuse](./application#unusepath).

## Custom Methods

A custom method is any other service method you want to expose publicly. A custom method **must have** the signature of `(data, params)` with the same semantics as standard service methods (`data` is the payload, `params` is the service [params](#params)). They can be used with [hooks](./hooks) (including authentication) and must be `async` or return a Promise.

In order to register a public custom method, the names of _all methods_ have to be passed as the `methods` option when registering the service with [app.use()](./application#usepath-service--options)

```ts
import type { Id, Params } from '@feathersjs/feathers'

type CustomData = {
  name: string
}

class MyService {
  async get(id: Id, params: Params) {
    return {
      id,
      message: `You have to do ${id}`
    }
  }

  async myCustomMethod(data: CustomData, params: Params) {
    return data
  }
}

type ServiceTypes = {
  'my-service': MyService
}

const app = feathers<ServiceTypes>()
  .configure(rest())
  .use('my-service', new MyService(), {
    // Pass all methods you want to expose
    methods: ['get', 'myCustomMethod']
  })
```

See the [REST client](./client/rest) and [Socket.io client](./client/socketio) chapters on how to use those custom methods on the client.

::warning[Important]
When passing the `methods` option **all methods** you want to expose, including standard service methods, must be listed. This allows to completely disable standard service method you might not want to expose. The `methods` option only applies to external access (via a transport like HTTP or websockets). All methods continue to be available internally on the server.
::

## Feathers functionality

When registering a service, Feathers (or its plugins) can also add its own methods to a service. Most notably, every service will automatically become an instance of a [NodeJS EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter).

### .hooks(hooks)

Register [hooks](./hooks) for this service.

### .publish([event, ] publisher)

Register an event publishing callback. For more information, see the [channels chapter](./channels).

### .on(eventname, listener)

Provided by the core [NodeJS EventEmitter .on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener). Registers a `listener` method (`function(data) {}`) for the given `eventname`.

::note
For more information about service events, see the [Events chapter](./events).
::

### .emit(eventname, data)

Provided by the core [NodeJS EventEmitter .emit](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args). Emits the event `eventname` to all event listeners.

### .removeListener(eventname)

Provided by the core [NodeJS EventEmitter .removeListener](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener). Removes all listeners, or the given listener, for `eventname`.
