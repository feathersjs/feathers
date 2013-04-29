# Feathry

A resource service framework for easily creating REST and SocketIO APIs with NodeJS.

## Get started

Services are just simple objects that provide certain methods. This makes it easy to initialize a
service that provides a single todo:

```js
var feathry = require('feathry');

feathry.createServer({ port: 8000 })
	.service('todo', {
	  get: function(name, params, callback) {
	    callback(null, {
	      id: name,
	      description: "You have to do " + name + "!"
	    });
	  }
	})
	.provide(feathry.rest())
	.provide(feathry.socketio())
	.start();
```

### REST

You can access the REST service by going to `http://localhost:8000/todo/dishes` in your browser
and will see:

  {
    "id": "dishes",
    "description": "You have to do dishes!"
  }

### SocketIO

Since you added it as a provider, you can also connect to your service via SocketIO.
Create an HTML page and insert the following code to see the response data logged on the console:

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');
  socket.emit('todo::get', 'laundry', {}, function(error, data) {
    console.log(data); // -> { id: 'laundry', description: 'You have to do laundry!' }
  });
</script>
```

## Services

A service can be any JavaScript object that offers one or more of the `index`, `get`, `create`, `update`,
`destroy` and `setup` service methods:

```js
var myService = {
  index: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params, callback) {},
  update: function(id, data, params, callback) {},
  destroy: function(id, params, callback) {},
  setup: function(server) {}
}
```

All callbacks follow the `function(error, data)` NodeJS convention. `params` contains additional
parameters like the query parameters of a REST API call. For example `http://localhost:8000/todo/dishes?done=true`
from the getting started example would result in `{ done: 'true' }` as the `params` object.

### index(params, callback)

Retrieves a list of all resources of the service. `params` contains additional parameters such
as URL query parameters (like `http://localhost:8000/todo?sort=status`).

### get(id, params, callback)

### create(data, params, callback)

### update(id, data, params, callback)

### destroy(id, params, callback)

### setup(registry)

## Built in services

To make it easier to get started, Feathry comes with several standard service implementations to extend
from. All built in services follow the same parameter conventions for things like sorting and filtering.

### Memory

### Mongoskin (MongoDB)

## Service mixins

### Event

### Association

### Validation

### Authentication
