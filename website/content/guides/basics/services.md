

# Services

Services are the heart of every Feathers application. You probably remember the message service we created in the [quick start](./starting). In this chapter we will dive deeper into services, their methods and how events work.

## Feathers services

In Feathers, a service is an object or instance of a class that implements certain methods. Services provide a way to interact with different kinds of data sources (databases, APIs, file systems) in a uniform, protocol-independent way.

A standardized interface allows us to interact with any data source in a uniform manner across any transport. Once you write a service method, you can automatically use it as a REST endpoint, through real-time events, or call it internally within the application. Feathers takes care of all the transport boilerplate.

### Service methods

Service methods are [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) methods that a service can implement:

- `find(params)` - Find all data (potentially matching a query)
- `get(id, params)` - Get a single data entry by its unique identifier
- `create(data, params)` - Create new data
- `update(id, data, params)` - Replace an existing data entry completely
- `patch(id, data, params)` - Update one or more data entries by merging with the new data
- `remove(id, params)` - Remove one or more existing data entries
- `setup(app, path)` - Called when the application is started
- `teardown(app, path)` - Called when the application is shut down

Below is an example of a Feathers service class:

```js
class MyService {
  async find(params) {}
  async get(id, params) {}
  async create(data, params) {}
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  async setup(app, path) {}
  async teardown(app, path) {}
}

const app = feathers()

app.use('myservice', new MyService())
```

The parameters for service methods are:

- `id` - The unique identifier for the data
- `data` - The data sent by the user (for `create`, `update`, `patch` and custom methods)
- `params` - Additional parameters for the method call (see below)

::note
A service does not have to implement all those methods but must have at least one. For more information about services, service methods, and parameters see the [Service API documentation](../../api/services).
::

### params

`params` contain additional information for the service method call. Commonly used are:

- `params.query` - The query parameters from the client (e.g. URL query string)
- `params.provider` - The transport used for this service call (`'rest'` for HTTP, `undefined` for internal calls)
- `params.headers` - The HTTP headers of the request
- `params.route` - Route placeholder parameters

::warning[Important]
For external calls only `params.query` will be sent between the client and server. Other parameters like `params.user` are set on the server and should never be trusted from the client.
::

### REST API mapping

When used as a REST API, incoming requests get mapped automatically to their corresponding service method:

| Service method                              | HTTP method | Path                  |
| ------------------------------------------- | ----------- | --------------------- |
| `service.find({ query: {} })`               | GET         | /messages             |
| `service.find({ query: { unread: true } })` | GET         | /messages?unread=true |
| `service.get(123)`                          | GET         | /messages/123         |
| `service.create(body)`                      | POST        | /messages             |
| `service.update(123, body)`                 | PUT         | /messages/123         |
| `service.patch(123, body)`                  | PATCH       | /messages/123         |
| `service.remove(123)`                       | DELETE      | /messages/123         |

## Service events

One of the most powerful features of Feathers services is that they automatically emit events when a method completes. This is the foundation for real-time functionality.

The following events are emitted automatically:

| Service method | Event     |
| -------------- | --------- |
| `create`       | `created` |
| `update`       | `updated` |
| `patch`        | `patched` |
| `remove`       | `removed` |

We already saw this in the [quick start](./starting) when we listened for the `created` event:

```js
app.service('messages').on('created', (message) => {
  console.log('A new message has been created', message)
})
```

Events are not fired until all [hooks](./hooks) have completed. On the server, services can also emit [custom events](../../api/events#custom-events).

## Registering services

Services are registered on a Feathers application using `app.use(path, service, options)` and then retrieved using `app.service(path)`:

```js
app.use('messages', new MessageService())

// Get the service and call methods on it
const messages = await app.service('messages').find()
```

::danger
Always use the service returned by `app.service(path)`, not the service object directly. `app.service()` returns a wrapped version that includes all Feathers functionality like events and hooks.
::

The `options` object allows you to control which methods are available externally and declare custom events:

```js
app.use('messages', new MessageService(), {
  // Only allow find and create from the outside
  methods: ['find', 'create'],
  // Declare custom events this service will emit
  events: ['status']
})
```

## Organizing with app.configure

For better code organization, `app.configure(callback)` can be used to split service registration into separate functions or files:

```js
import { feathers } from 'feathers'

// A function that registers a service
const messageService = (app) => {
  app.use('messages', new MessageService())
}

const app = feathers()

// Register the service using configure
app.configure(messageService)
```

This is the pattern used in generated Feathers applications where each service is defined in its own file that exports a configure function.

## Custom methods

In addition to the standard CRUD methods, services can define custom methods. Custom methods must take `(data, params)` as arguments and need to be listed in the `methods` option:

```js
class MessageService {
  async find(params) {
    // ...
  }

  async create(data, params) {
    // ...
  }

  // A custom method
  async markAsRead(data, params) {
    // Mark messages as read
    return { read: true, ids: data.ids }
  }
}

app.use('messages', new MessageService(), {
  methods: ['find', 'create', 'markAsRead']
})

// Call the custom method
await app.service('messages').markAsRead({ ids: [1, 2, 3] })
```

Custom methods can be called via HTTP by setting the `X-Service-Method` header on a POST request.

## What's next?

In this chapter we learned how Feathers services provide a uniform interface for interacting with data, how they automatically emit events, and how to organize them with `app.configure`. We also saw how services map to a REST API and can be extended with custom methods.

In the [next chapter](./hooks) we will look at hooks, which allow us to add additional functionality to any service method without changing the service itself.
