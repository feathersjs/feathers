# Application

::badges{npm="@feathersjs/feathers" changelog="https://github.com/feathersjs/feathers/blob/dove/packages/feathers/CHANGELOG.md"}
::

```
npm install @feathersjs/feathers --save
```

The core `@feathersjs/feathers` module provides the ability to initialize a new Feathers application instance. It works in Node, React Native and the browser (see the [client](./client) chapter for more information). Each instance allows for registration and retrieval of [services](./services), [hooks](./hooks), plugin configuration, and getting and setting configuration options. An initialized Feathers application is referred to as the **app object**.

```ts
import { feathers } from '@feathersjs/feathers'

type ServiceTypes = {
  // Add registered services here
}

// Types for `app.set(name, value)` and `app.get(name)`
type Configuration = {
  port: number
}

const app = feathers<ServiceTypes, Configuration>()
```

## .use(path, service [, options])

`app.use(path, service [, options]) -> app` allows registering a [service object](./services) on a given `path`.

```ts
import { feathers, type Id } from '@feathersjs/feathers'

class MessageService {
  async get(id: Id) {
    return {
      id,
      text: `This is the ${id} message!`
    }
  }
}

type ServiceTypes = {
  // Add services path to type mapping here
  messages: MessageService
}

const app = feathers<ServiceTypes>()

// Register a service instance on the app
app.use('messages', new MessageService())

// Get the service and call the service method with the correct types
const message = await app.service('messages').get('test')
```

### path

The `path` is a string that should be URL friendly and may contain `/` as a separator. `path` can also be `/` to register a service at the root level. A path may contain placeholders in the form of `:userId/messages` which will be included in `params.route` by a transport.

### options

The following options are available:

- `methods` (default: `['find', 'get', 'create', 'patch', 'update','remove']`) - A list of official and [custom service methods](services#custom-methods) that should be available to clients. When using this option **all** method names that should be available externally must be passed. Those methods will automatically be available for use with [hooks](./hooks).
- `events` - A list of [public custom events sent by this service](./events#custom-events)

```ts
import { feathers, type Id, EventEmitter } from '@feathersjs/feathers'

// Feathers services will always be event emitters
// but we can also extend it for better type consistency
class MessageService extends EventEmitter {
  async doSomething(data: { message: string }, params: Params) {
    this.emit('something', 'I did something')
    return data
  }

  async get(id: Id) {
    return {
      id,
      text: `This is the ${id} message!`
    }
  }
}

type ServiceTypes = {
  // Add services path to type mapping here
  messages: MessageService
}

const app = feathers<ServiceTypes>()

// Register a service with options
app.use('messages', new MessageService(), {
  methods: ['get', 'doSomething'],
  events: ['something']
})
```

::warning[Important]
If the `methods` property is `undefined`, all standard methods will be enabled and accessible externally.
::

## .unuse(path)

`app.unuse(path)` unregisters an existing service on `path` and calls the services [.teardown method](./services#teardownapp-path) if it is implemented.

## .service(path)

`app.service(path) -> service` returns the [service object](./services) for the given path. Feathers internally creates a new object from each registered service. This means that the object returned by `app.service(path)` will provide the same methods and functionality as your original service object but also functionality added by Feathers and its plugins like [service events](./events) and [additional methods](./services#feathers-functionality).

```ts
const messageService = app.service('messages')

const message = await messageService.get('test')

console.log(message)

messageService.on('created', (message: Message) => {
  console.log('Created a todo')
})
```

::note[Note]
Note that a server side `app.service(path)` only allows the original service name (e.g. `app.service(':userId/messages')`) and does not parse placeholders. To get a service with route paramters use [.lookup](#lookuppath)
::

## .lookup(path)

`app.lookup(path)` allows to look up a full path and will return the `data` (route parameters) and `service` **on the server**.

```ts
const lookup = app.lookup('messages/4321')

// lookup.service -> app.service('messages')
// lookup.data -> { __id: '4321' }

// `lookup.dta` needs to be passed as `params.route`
lookup.service.find({
  route: lookup.data
})
```

Case insensitive lookups can be enabled in the `app` file like this:

```ts
app.routes.caseSensitive = false
```

## .hooks(hooks)

`app.hooks(hooks) -> app` allows registration of application-level hooks. For more information see the [application hooks section in the hooks chapter](./hooks#application-hooks).

## .publish([event, ] publisher)

`app.publish([event, ] publisher) -> app` registers a global event publisher. For more information see the [channels publishing](./channels#publishing) chapter.

## .configure(callback)

`app.configure(callback) -> app` runs a `callback` function that gets passed the application object. It is used to initialize plugins and can be used to separate your application into different files.

```ts
const setupService = (app: Application) => {
  app.use('/todos', todoService)
}

app.configure(setupService)
```

## .setup([server])

`app.setup([server]) -> Promise<app>` is used to initialize all services by calling each [services .setup(app, path)](services#setupapp-path) method (if available).
It will also use the `server` instance passed (e.g. through `http.createServer`) to set up SocketIO (if enabled) and any other provider that might require the server instance. You can register [application setup hooks](./hooks#setup-and-teardown) to e.g. set up database connections and other things required to be initialized on startup in a certain order.

Normally `app.setup` will be called automatically when starting the application via [app.listen([port])](#listen-port) but there are cases (like in tests) when it can be called explicitly.

## .teardown([server])

`app.teardown([server]) -> Promise<app>` can be called to gracefully shut down the application. When the app has been set up with a server (e.g. by calling `app.listen()`) the server will be closed automatically when calling `app.teardown()`. You can also register [application hooks](./hooks#setup-and-teardown) on teardown to e.g. close database connection etc.

## .listen(port)

`app.listen([port]) -> Promise<HTTPServer>` starts the application on the given port. It will set up all configured transports (if any) and then run [app.setup(server)](#setup-server) with the server object and then return the server object.

`listen` will only be available if a server side transport (REST or websocket) has been configured.

## .set(name, value)

`app.set(name, value) -> app` assigns setting `name` to `value`.

::danger
`app.set` is global to the application. It is used for storing application wide information like database connection strings etc. **Do not use it for storing request or service specific data.** This can be done by adding data to the [hook context](./hooks#hook-context).
::

```ts
import { feathers } from '@feathersjs/feathers'

type ServiceTypes = {
  // Add services path to type mapping here
}

// app.get and app.set can be typed when initializing the app
type Configuration = {
  port: number
}

const app = feathers<ServiceTypes, Configuration>()

app.set('port', 3030)

app.listen(app.get('port'))
```

::note[Note]
On the server, settings are usually initialized using [Feathers configuration](configuration).
::

## .get(name)

`app.get(name) -> value` retrieves the setting `name`.

## .on(eventname, listener)

Provided by the core [NodeJS EventEmitter .on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener). Registers a `listener` method (`function(data) {}`) for the given `eventname`.

```js
app.on('login', (user) => console.log('Logged in', user))
```

## .emit(eventname, data)

Provided by the core [NodeJS EventEmitter .emit](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args).

```ts
type MyEventData = { message: string }

app.emit('myevent', {
  message: 'Something happened'
})

app.on('myevent', (data: MyEventData) => console.log('myevent happened', data))
```

::warning[Important]
`app` can not receive or send events to or from clients. A [custom service](./services) should be used for that.
::

## .removeListener(eventname)

Provided by the core [NodeJS EventEmitter .removeListener](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener). Removes all or the given listener for `eventname`.

## .mixins

`app.mixins` contains a list of service mixins. A mixin is a callback (`(service, path, options) => {}`) that gets run for every service that is being registered. Adding your own mixins allows to add functionality to every registered service.

```ts
import type { Id } from '@feathersjs/feathers'

// Mixins have to be added before registering any services
app.mixins.push((service: any, path: string) => {
  service.sayHello = function () {
    return `Hello from service at '${path}'`
  }
})

app.use('/todos', {
  async get(id: Id) {
    return { id }
  }
})

app.service('todos').sayHello()
// -> Hello from service at 'todos'
```

## .services

`app.services` contains an object of all [services](./services) keyed by the path they have been registered via `app.use(path, service)`. This allows to return a list of all available service names:

```ts
const servicePaths = Object.keys(app.services)

servicePaths.forEach((path) => {
  const service = app.service(path)
})
```

::danger
To retrieve services use [app.service(path)](#service-path), not `app.services[path]` directly.
::

A Feathers [client](client) does not know anything about the server it is connected to. This means that `app.services` will _not_ automatically contain all services available on the server. Instead, the server has to provide the list of its services, e.g. through a [custom service](./services):

```ts
class InfoService {
  constructor(public app: Application) {}

  async find() {
    return {
      service: Object.keys(this.app.services)
    }
  }
}

app.use('info', new InfoService(app))
```

## .defaultService

`app.defaultService` can be a function that returns an instance of a new standard service for `app.service(path)` if there isn't one registered yet. By default it throws a `NotFound` error when you are trying to access a service that doesn't exist.

```ts
import { MemoryService } from '@feathersjs/memory'

// For every `path` that doesn't have a service
// Automatically return a new in-memory service
app.defaultService = function (path: string) {
  return new MemoryService()
}
```

This is used by the [client transport adapters](./client) to automatically register client side services that talk to a Feathers server.
