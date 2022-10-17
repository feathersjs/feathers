# Application

```
npm install @feathersjs/feathers --save
```

The core `@feathersjs/feathers` module provides the ability to initialize a new Feathers application instance. It works in Node, React Native and the browser (see the [client](./client.md) chapter for more information). Each instance allows for registration and retrieval of [services](./services.md), [hooks](./hooks.md), plugin configuration, and getting and setting configuration options. An initialized Feathers application is referred to as the **app object**.

```js
const feathers = require('@feathersjs/feathers');

const app = feathers();
```

## .use(path, service [, options])

`app.use(path, service [, options]) -> app` allows registering a [service object](./services.md) on a given `path`.

```js
// Add a service.
app.use('/messages', {
  async get(id) {
    return {
      id,
      text: `This is the ${id} message!`
    };
  }
});
```

> __Note:__ `path` can be `/` to register a service at the root level.

`options` can contain the following additional options for the service:

- `methods` (default: `['find', 'get', 'create', 'patch', 'update','remove']`) - A list of official and [custom service methods](services.md#custom-methods) exposed by this service. When using this option **all** method names that should be available externally must be passed otherwise. All methods passed will automatically be available for use with [hooks](./hooks).
- `events` - A list of [public custom events sent by this service](./events.md#custom-events)

```js
class MyService {
  async doSomething (data, params) {
    this.emit('something', 'I did something');
    return data;
  }

  async get(id) {
    return {
      id,
      text: `This is the ${id} message!`
    };
  }
}

app.use('/messages', new MyService(), {
  methods: [ 'get', 'doSomething' ],
  events: [ 'something' ]
});
```

## .service(path)

`app.service(path) -> service` returns the wrapped [service object](./services.md) for the given path. Feathers internally creates a new object from each registered service. This means that the object returned by `app.service(path)` will provide the same methods and functionality as your original service object but also functionality added by Feathers and its plugins like [service events](./events.md) and [additional methods](./services.md#feathers-functionality). `path` can be the service name with or without leading and trailing slashes.

```js
const messageService = app.service('messages');

const message = await messageService.get('test');

console.log(message);

app.use('/my/todos', {
  async create(data) {
    return data;
  }
});

const todoService = app.service('my/todos');
// todoService is an event emitter
todoService.on('created', todo => 
  console.log('Created todo', todo)
);
```

## .hooks(hooks)

`app.hooks(hooks) -> app` allows registration of application-level hooks. For more information see the [application hooks section in the hooks chapter](./hooks.md#application-hooks).

## .publish([event, ] publisher)

`app.publish([event, ] publisher) -> app` registers a global event publisher. For more information see the [channels publishing](./channels.md#publishing) chapter.

## .configure(callback)

`app.configure(callback) -> app` runs a `callback` function that gets passed the application object. It is used to initialize plugins or services.

```js
function setupService(app) {
  app.use('/todos', todoService);
}

app.configure(setupService);
```

## .listen(port)

`app.listen([port]) -> Promise<HTTPServer>` starts the application on the given port. It will set up all configured transports (if any) and then run [app.setup(server)](#setup-server) with the server object and then return the server object.

`listen` will only be available if a server side transport (REST or websocket) has been configured.

## .setup([server])

`app.setup([server]) -> Promise<app>` is used to initialize all services by calling each [services .setup(app, path)](services.md#setupapp-path) method (if available).
It will also use the `server` instance passed (e.g. through `http.createServer`) to set up SocketIO (if enabled) and any other provider that might require the server instance. You can register [application hooks](./hooks.md#application-hooks) on setup to e.g. set up database connections and other things required to be initialized on startup in a certain order.

Normally `app.setup` will be called automatically when starting the application via `app.listen([port])` but there are cases when it needs to be called explicitly.

## .teardown([server])

`app.teardown([server]) -> Promise<app>` can be called to gracefully shut down the application. When the app has been set up with a server (e.g. by calling `app.listen()`) the server will be closed automatically when calling `app.teardown()`. You can also register [application hooks](./hooks.md#application-hooks) on teardown to e.g. close database connection etc.

## .set(name, value)

`app.set(name, value) -> app` assigns setting `name` to `value`. 

## .get(name)

`app.get(name) -> value` retrieves the setting `name`. For more information on server side Express settings see the [Express documentation](http://expressjs.com/en/4x/api.html#app.set).

```js
app.set('port', 3030);

app.listen(app.get('port'));
```

## .on(eventname, listener)

Provided by the core [NodeJS EventEmitter .on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener). Registers a `listener` method (`function(data) {}`) for the given `eventname`.

```js
app.on('login', user => console.log('Logged in', user));
```

## .emit(eventname, data)

Provided by the core [NodeJS EventEmitter .emit](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args). Emits the event `eventname` to all event listeners.

```js
app.emit('myevent', {
  message: 'Something happened'
});

app.on('myevent', data => console.log('myevent happened', data));
```

## .removeListener(eventname)

Provided by the core [NodeJS EventEmitter .removeListener](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener). Removes all or the given listener for `eventname`.

## .mixins

`app.mixins` contains a list of service mixins. A mixin is a callback (`(service, path, options) => {}`) that gets run for every service that is being registered. Adding your own mixins allows to add functionality to every registered service.

```js
const feathers = require('@feathersjs/feathers');
const app = feathers();

// Mixins have to be added before registering any services
app.mixins.push((service, path) => {
  service.sayHello = function() {
    return `Hello from service at '${path}'`;
  }
});

app.use('/todos', {
  async get(id) {
    return { id };
  }
});

app.service('todos').sayHello();
// -> Hello from service at 'todos'
```

## .services

`app.services` contains an object of all [services](./services.md) keyed by the path they have been registered via `app.use(path, service)`. This allows to return a list of all available service names:

```js
const servicePaths = Object.keys(app.services);

servicePaths.forEach(path => {
  const service = app.service(path);

  console.log(path, service);
});
```

> __Important:__ To retrieve services, the [app.service(path)](#servicepath) method should be used (not `app.services.path` directly).

A Feathers [client](client.md) does not know anything about the server it is connected to. This means that `app.services` will _not_ automatically contain all services available on the server. Instead, the server has to provide the list of its services, e.g. through a [custom service](./services.md):

```js
app.use('/info', {
  async find() {
    return {
      services: Object.keys(app.services)
    }
  }
});
```

## .defaultService

`app.defaultService` can be a function that returns an instance of a new standard service for `app.service(path)` if there isn't one registered yet.

```js
const memory = require('feathers-memory');

// For every `path` that doesn't have a service automatically return a new in-memory service
app.defaultService = function(path) {
  return memory();
}
```

This is used by the [client transport adapters](./client.md) to automatically register client side services that talk to a Feathers server.

## .lookup

`app.lookup(path)` allows to look up a full path and will return the `data` (route parameters) and `service` on the server:

```js
const { data, service } = app.lookup('messages/4321');

// service -> app.service('messages')
// data -> { __id: '4321' }
```
