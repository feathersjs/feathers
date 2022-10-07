---
outline: deep
---

# Services

Services are the heart of every Feathers application. You probably remember the service we created in the [quick start](./starting.md) to create and find messages. In this chapter we will dive more into services and create a database backed service for our chat messages.

## Feathers services

In general, a service is an object or instance of a class that implements certain methods. Services provide a uniform, protocol independent interface for how to interact with any kind of data like:

- Reading and/or writing from a database
- Interacting with the file system
- Calling another API
- Calling other services like
  - Sending an email
  - Processing a payment
  - Returning the current weather for a location, etc.

Protocol independent means that to a Feathers service it does not matter if it has been called through a REST API, websockets, internally in our application or any other way.

### Service methods

Service methods are [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) methods that a service can implement. The Feathers service methods are:

- `find` - Find all data (potentially matching a query)
- `get` - Get a single data entry by its unique identifier
- `create` - Create new data
- `update` - Update an existing data entry by completely replacing it
- `patch` - Update one or more data entries by merging with the new data
- `remove` - Remove one or more existing data entries
- `setup` - Called when the application is started
- `teardown` - Called when the application is shut down

Below is an example of Feathers service interface as a class:

```ts
import type { Application, Id, NullableId, Params, Service } from '@feathersjs/feathers';

class MyService implements Service<any> {
  async find(params: Params) {}
  async get(id: Id, params: Params) {}
  async create(data: any, params: Params) {}
  async update(id: NullableId, data: any, params: Params) {}
  async patch(id: NullableId, data: any, params: Params) {}
  async remove(id: NullableId, params: Params) {}
  async setup (path: string, app: Application) {}
  async teardown (path: string, app: Application) {}
}

app.use('/my-service', new MyService());
```

The parameters for service methods are:

- `id` - The unique identifier for the data
- `data` - The data sent by the user (for creating, updating and patching)
- `params` - Additional parameters, for example the authenticated user or the query

For `setup` and `teardown` (which are only called once on application startup and shutdown) we additionally have

- `path` - The path the service is registered on
- `app` - The [Feathers application](./../../api/application.md)

Usually those methods can be used for most API functionality but it is also possible to add your own [custom service methods](../../api/services.md#custom-methods) for a client to call.

<BlockQuote type="info">

A service does not have to implement all those methods but must have at least one. For more information about services, service methods, and parameters see the [Service API documentation](../../api/services.md).

</BlockQuote>

When used as a REST API, incoming requests get mapped automatically to their corresponding service method like this:

| Service method | HTTP method | Path |
|---|---|---|
| `service.find({ query: {} })` | GET | /messages |
| `service.find({ query: { unread: true } })` | GET | /messages?unread=true |
| `service.get(1)` | GET | /messages/1 |
| `service.create(body)` | POST | /messages |
| `service.update(1, body)` | PUT | /messages/1 |
| `service.patch(1, body)` | PATCH | /messages/1 |
| `service.remove(1)` | DELETE | /messages/1 |

### Registering services

A service can be registered on the Feathers application by calling [app.use(name, service)](../../api/application.md#use-path-service) with a name and the service instance:

```ts
import { feathers, type Params } from '@feathersjs/feathers'

class MessageService {
  async get (name: string, params: Params) {
    return {
      message: `You have to do ${name}`
    }
  }
}

type ServiceTypes = {
  messages: MessageService
}

const app = feathers<ServiceTypes>()

// Register the message service on the Feathers application
app.use('messages', new MessageService())
```

To get the service object and use the service methods (and events) we can use [app.service(name)](../../api/application.md#service-path):

```js
const messageService = app.service('messages');
const messages = await messageService.find();
```

### Service events

A registered service will automatically become a [NodeJS EventEmitter](https://nodejs.org/api/events.html) that sends events with the new data when a service method that modifies data (`create`, `update`, `patch` and `remove`) returns. Events can be listened to with `app.service('messages').on('eventName', data => {})`. Here is a list of the service methods and their corresponding events:

| Service method     | Service event           |
| ------------------ | ----------------------- |
| `service.create()` | `service.on('created')` |
| `service.update()` | `service.on('updated')` |
| `service.patch()`  | `service.on('patched')` |
| `service.remove()` | `service.on('removed')` |

This is how Feathers does real-time and how we updated the messages automatically by listening to

```js
app.service('messages').on('created', data => {
  console.log(data)
})
```

## Database adapters

Now that we have all those service methods we could go ahead and implement any kind of custom logic using any backend. Very often, that means creating, reading, updating and removing data from a database.

Writing all that code yourself for every service is pretty repetitive and cumbersome, which is why Feathers has a collection of pre-built services for different databases. They offer most of the basic functionality and can always be customized to your needs. Feathers database adapters support a common [usage API](../../api/databases/common.md), pagination and [querying syntax](../../api/databases/querying.md) for many popular databases. The following database adapters are maintained as part of FeathersJS Core.

| Database | Adapter |
|---|---|
| In memory | [@feathersjs/memory](../../api/databases/memory.md) |
| MongoDB | [@feathers/mongodb](../../api/databases/mongodb.md) |
| SQLite, MySQL, PostgreSQL, MariaDB, MSSQL | [@feathersjs/knex](../../api/databases/knex.md) |

For community supported databases adapters see the [ecosystem page](https://github.com/feathersjs/awesome-feathersjs#database).

If you went with the default selection, we will use SQLite which writes the database to a file and does not require any additional setup. The user service that was created when we [generated our application](./generator.md) is already using it. If you decide to use another SQL database like PostgreSQL or MySQL, you will need to change the database connection settings in the configuration.

## Generating a service

In our [newly generated](./generator.md) `feathers-chat` application, we can create database backed services with the following command:

```sh
npx feathers generate service
```

The name for our service is `message` (this is used for variable names etc.) and for the path use `messages`. Anything else we can confirm with the default:

![feathers generate service prompts](./assets/generate-service.png)

This is it, we now have a database backed messages service with authentication enabled.

## What's next?

In this chapter we learned about services as a Feathers core concept for abstracting data operations. We also saw how a service sends events which we will use later to create real-time applications. After that, we generated a messages service. Next, we will [look at Feathers hooks](./hooks.md) as a way to create middleware for services.
