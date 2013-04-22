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
  var socket = io.connect('http://localhost');
  socket.emit('todo::get', 'laundry', {}, function(error, data) {
    console.log(data); // -> { id: 'laundry', description: 'You have to do laundry!' }
  });
</script>
```

## Services

A service can be pretty much any JavaScript object that offers one or more of the `index`, `get`, `create`, `update`,
`destroy` and `setup` service methods:

```js
var myService = {
  index: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params) {},
  update: function(id, data, params, callback) {},
  destroy: function(id, params, callback) {},
  setup: function(server) {}
}
```

All callbacks follow the `function(error, data)` NodeJS convention.

### index(params, callback)

### get(id, params, callback)

### create(data, params)

### update(id, data, params, callback)

### destroy(id, params, callback)

### setup(server)

## Built in services

## Service mixins

### Events

### Association

### Validation

### Authentication
