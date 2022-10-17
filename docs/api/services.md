# Services

"Services" are the heart of every Feathers application. Services are JavaScript objects (or instances of [ES6 classes](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes)) that implement [certain methods](#service-methods). Feathers itself will also add some [additional methods and functionality](#feathers-functionality) to its services.

## Service methods

Service methods are pre-defined [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) and [custom methods](#custommethod-data-params) that your service provides (or that have already been implemented by one of the [database adapters](./databases/common.md)). Below is an example of a Feathers service using [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) as a normal object or a [JavaScript or Typescript class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes):

:::: tabs :options="{ useUrlFragment: false }"

::: tab "Object"
```js
const myService = {
  async find(params) {
    return [];
  },
  async get(id, params) {},
  async create(data, params) {},
  async update(id, data, params) {},
  async patch(id, data, params) {},
  async remove(id, params) {},
  async setup(app, path) {}
}

app.use('/my-service', myService);
```
:::

::: tab "JavaScript"
```js
class MyService {
  async find(params) {
    return [];
  }
  async get(id, params) {}
  async create(data, params) {}
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  async setup(app, path) {}
}

app.use('/my-service', new MyService());
```
:::

::: tab "TypeScript"
```typescript
import { ServiceMethods, Params, Id, NullableId } from "@feathersjs/feathers";
import { Application } from "../../declarations";

class MyService implements ServiceMethods<any> {
  async find(params: Params) {
    return [];
  }
  async get(id: Id, params: Params) {}
  async create(data: any, params: Params) {}
  async update(id: NullableId, data: any, params: Params) {}
  async patch(id: NullableId, data: any, params: Params) {}
  async remove(id: NullableId, params: Params) {}
  async setup(app: Application, path: string) {}
}

app.use('/my-service', new MyService());
```
:::

::::

> **ProTip:** Methods are optional and if a method is not implemented Feathers will automatically emit a `NotImplemented` error. At least one of the methods (e.g. `setup`) must be implemented to be considered a service.

> **ProTip:** Notice that the TypeScript version of the example `MyService` class implements the `ServiceMethods` interface. If you look at, for instance, the users service that the Feathers CLI generates for you when you scaffold a new Feathers application you will notice that the users service class extends the chosen [database adapter](./databases/common.md) service class. The database adapter service classes actually extend a class named `AdapterService`, which implements the `ServiceMethods` interface.

> __Important:__ Always use the service returned by `app.service(path)` not the service object (the `myService` object above) directly. See the [app.service documentation](./application.md#servicepath) for more information.

Service methods must use [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) or return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and have the following parameters:

- `id` — The identifier for the resource. A resource is the data identified by a unique id.
- `data` — The resource data.
- `params` - Additional parameters for the method call (see [params](#params))

Once registered, the service can be retrieved and used via [app.service()](./application.md#servicepath):

```js
const myService = app.service('my-service');

const items = await myService.find();

const item = await app.service('my-service').get(1);

console.log('.get(1)', item);
```

> **Note:** Although probably the most common use case, a service does not necessarily have to connect to a database. A custom service can implement any functionality like talking to another API or send an email etc.

> **Important:** This section describes the general usage of service methods and how to implement them. They are already implemented by the official Feathers database adapters. For specifics on how to use the database adapters, see the [database adapters common API](./databases/common.md).

### params

`params` contain additional information for the service method call. Some properties in `params` can be set by Feathers already. Commonly used are:

- `params.query` - the query parameters from the client, either passed as URL query parameters (see the [REST](./express.md) chapter) or through websockets (see [Socket.io](./socketio.md)).
- `params.provider` - The transport (`rest` or `socketio`) used for this service call. Will be `undefined` for internal calls from the server (unless passed explicitly).
- `params.authentication` - The authentication information to use for the [authentication service](./authentication/service.md)
- `params.user` - The authenticated user, either set by [Feathers authentication](./authentication/) or passed explicitly.
- `params.connection` - If the service call has been made by a real-time transport (e.g. through websockets), `params.connection` is the connection object that can be used with [channels](./channels.md).
- `params.headers` - The HTTP headers connected to this service call if available. This is either the headers of the REST call or the headers passed when initializing a websocket connection.

> __Important:__ For external calls only `params.query` will be sent between the client and server. If not passed, `params.query` will be `undefined` for internal calls.

### .find(params)

`service.find(params) -> Promise` - Retrieves a list of all resources from the service. `params.query` can be used to filter and limit the returned data.

```js
app.use('/messages', {
  async find(params) {
    return [{
      id: 1,
      text: 'Message 1'
    }, {
      id: 2,
      text: 'Message 2'
    }];
  }
});
```

> **Note:** `find` does not have to return an array; it can also return an object. The database adapters already do this for [pagination](./databases/common.md#pagination).

### .get(id, params)

`service.get(id, params) -> Promise` - Retrieves a single resource with the given `id` from the service.

```js
app.use('/messages', {
  async get(id, params) {
    return {
      id,
      text: `You have to do ${id}!`
    };
  }
});
```

### .create(data, params)

`service.create(data, params) -> Promise` - Creates a new resource with `data`. The method should return with the newly created data. `data` may also be an array.

```js
app.use('/messages', {
  messages: [],

  async create(data, params) {
    this.messages.push(data);

    return data;
  }
});
```

> **Important:** A successful `create` method call emits the [`created` service event](./events.md#created).

> **Note:** With a [database adapters](./databases/adapters.md) `data` can be an array but the [`multi` option](./databases/common.md) has to be set.


### .update(id, data, params)

`service.update(id, data, params) -> Promise` - Replaces the resource identified by `id` with `data`. The method should return with the complete, updated resource data. `id` can also be `null` when updating multiple records, with `params.query` containing the query criteria.

> **Important:** A successful `update` method call emits the [`updated` service event](./events.md#updated-patched).

> **Note:** The [database adapters](./databases/adapters.md) do not support completely replacing multiple entries. 

### .patch(id, data, params)

`patch(id, data, params) -> Promise` - Merges the existing data of the resource identified by `id` with the new `data`. `id` can also be `null` indicating that multiple resources should be patched with `params.query` containing the query criteria.

> **Note:** With a [database adapters](./databases/adapters.md) the [`multi` option](./databases/common.md) has to be set explicitly to support patching multiple entries.

The method should return with the complete, updated resource data. Implement `patch` additionally (or instead of) `update` if you want to distinguish between partial and full updates and support the `PATCH` HTTP method.

> **Important:** A successful `patch` method call emits the [`patched` service event](./events.md#updated-patched).


### .remove(id, params)

`service.remove(id, params) -> Promise` - Removes the resource with `id`. The method should return with the removed data. `id` can also be `null`, which indicates the deletion of multiple resources, with `params.query` containing the query criteria.

> **Important:** A successful `remove` method call emits the [`removed` service event](./events.md#removed).

> **Note:** With a [database adapters](./databases/adapters.md) the [`multi` option](./databases/common.md) has to be set explicitly to support removing multiple entries.


### .setup(app, path)

`service.setup(app, path) -> Promise` is a special method that initializes the service, passing an instance of the Feathers application and the path it has been registered on. 

For services registered before `app.listen` is invoked, the `setup` function of each registered service is called on invoking `app.listen`. For services registered after `app.listen` is invoked, `setup` is called automatically by Feathers when a service is registered.

`setup` is a great place to initialize your service with any special configuration or if connecting services that are very tightly coupled (see below).

```js
const feathers = require('@feathersjs/feathers');
const { rest } = require('@feathersjs/express');

class MessageService {
  async get(id, params) {
    return {
      id,
      read: false,
      text: `Feathers is great!`,
      createdAt: new Date.getTime()
    };
  }
}

class MyService {
  async setup(app) {
    this.app = app;
  }

  async get(name, params) {
    const messages = this.app.service('messages');
    const message = await messages.get(1, params);
    
    return { name, message };
  }
}

const app = feathers()
  .configure(rest())
  .use('/messages', new MessageService())
  .use('/my-service', new MyService())

app.listen(3030);
```

## Custom Methods

A custom method is any other service method you want to expose publicly. A custom method always has a signature of `(data, params)` with the same semantics as standard service methods (`data` is the payload, `params` is the service [params](#params)). They can be used with hooks (including authentication) and must be `async` or return a Promise.

In order to register a public custom method, the names of *all methods* have to be passed as the `methods` option when registering the service:

```js
class MyService {
  async setup(app) {
    this.app = app;
  }

  async get(name, params) {
    const messages = this.app.service('messages');
    const message = await messages.get(1, params);
    
    return { name, message };
  }

  async myCustomMethod (data, params) {
    return data;
  }
}

const app = feathers()
  .configure(rest())
  .use('/my-service', new MyService(), {
    // Pass all methods you want to expose
    methods: ['get', 'myCustomMethod']
  });
```

See the [REST client](./client/rest.md) and [Socket.io client](./client/socketio.md) chapters on how to use those custom methods on the client.

> __Important:__ When passing the `methods` option __all methods__ you want to expose, including standard service methods, must be listed. This allows to completely disable standard service method you might not want to expose. The `methods` option only applies to external access (via a transport like HTTP or websockets). All methods continue to be available internally on the server.

## Feathers functionality

When registering a service, Feathers (or its plugins) can also add its own methods to a service. Most notably, every service will automatically become an instance of a [NodeJS EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter).


### .hooks(hooks)

Register [hooks](./hooks.md) for this service.


### .publish([event, ] publisher)

Register an event publishing callback. For more information, see the [channels chapter](./channels.md).


### .on(eventname, listener)

Provided by the core [NodeJS EventEmitter .on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener). Registers a `listener` method (`function(data) {}`) for the given `eventname`.

> **Important:** For more information about service events, see the [Events chapter](./events.md).


### .emit(eventname, data)

Provided by the core [NodeJS EventEmitter .emit](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args). Emits the event `eventname` to all event listeners.

> **Important:** For more information about service events, see the [Events chapter](./events.md).


### .removeListener(eventname)

Provided by the core [NodeJS EventEmitter .removeListener](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener). Removes all listeners, or the given listener, for `eventname`.

> **Note:** For more information about service events, see the [Events chapter](./events.md).
