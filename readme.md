# Feathers

> Let your web app fly.

[![Build Status](https://travis-ci.org/feathersjs/feathers.png)](https://travis-ci.org/feathersjs/feathers)

Feathers is a light weight web application framework that rides on top of [Express](http://expressjs.com). It makes it easy to create RESTful web services and real-time applications using [socket.io](http://socket.io).

The core focus of Feathers is **your data**. We believe that ultimately your app's purpose is to manage data in some fashion and so that's all you should really need to deal with. Managing your data.

## Install

As with any NodeJS module, just install it as a dependency in your application:

> npm install feathers --save

## Getting Started Is Easy

Building an app with Feathers is easy. There are only 4 things to worry about. A wrapped express server, providers, services & middleware. Services are just simple modules that expose certain methods to the providers in order to CRUD your data. We can easily initialize a service that say... provides a single TODO:

```js
var feathers = require('feathers');

var todoService = {
  get: function(name, params, callback) {
    callback(null, {
      id: name,
      description: "You have to do " + name + "!"
    });
  }
};

feathers()
	.configure(feathers.socketio())
	.use('todo', todoService)
	.listen(8000);
```

That's all there really is to building an app with Feathers.

### REST

You can access the REST service by going to `http://localhost:8000/todo/dishes` in your browser
and will see:

```js
{
  "id": "dishes",
  "description": "You have to do dishes!"
}
```

> Note: Query parameters like `http://localhost:8000/todo/dishes?type=dirty` will be passed as `params.query`

### SocketIO

Since we configured our app with `feathers.socketio()`, you can also connect to your service via SocketIO.
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

A service can be any JavaScript object that offers one or more of the `find`, `get`, `create`, `update`,
`destroy` and `setup` service methods:

```js
var myService = {
  find: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params, callback) {},
  update: function(id, data, params, callback) {},
  destroy: function(id, params, callback) {},
  setup: function(app) {}
}
```

All callbacks follow the `function(error, data)` NodeJS convention. `params` can contain any additional parameters, for
example the currently authenticated user. REST service calls set `params.query` with the query parameters (e.g. a query string
like `?status=active&type=user` becomes `{ status: "active", type: "user" }`).

### `find(params, callback)`

Retrieves a list of all resources from the service. Ideally use `params.query` for things like filtering and paging so
that REST calls like `todo?status=completed&user=10` work right out of the box.

__REST__

> GET todo?status=completed&user=10

__SocketIO__

```js
socket.emit('todo::find', {
  status: 'completed'
  user: 10
}, function(error, data) {
});
```

### `get(id, params, callback)`

Retrieves a single resource with the given `id` from the service.

__REST__

> GET todo/1

__SocketIO__

```js
socket.emit('todo::get', 1, {}, function(error, data) {

});
```

### create(data, params, callback)

Creates a new resource with `data`. The callback should be called with that resource (and the id initialized).

__REST__

> POST todo
> { "description": "I really have to iron" }

By default the body can be eihter JSON or form encoded as long as the content type is set accordingly.

__SocketIO__

```js
socket.emit('todo::create', {
  description: 'I really have to iron'
}, function(error, data) {
});
```

### update(id, data, params, callback)

Updates the resource identified by `id` using `data`.

__REST__

> PUT todo/2
> { "description": "I really have to do laundry" }

__SocketIO__

```js
socket.emit('todo::update', 2, {
  description: 'I really have to do laundry'
}, {}, function(error, data) {
  // data -> { id: 2, description: "I really have to do laundry" }
});
```

### remove(id, params, callback)

Remove the resource with `id`.

__REST__

> DELETE todo/2

__SocketIO__

```js
socket.emit('todo::delete', 2, {}, function(error, data) {
});
```

### setup(app)

Initializes the service passing an instance of the Feathers application.
`app` can do everything a normal Express application does and additionally provides `app.lookup(path)`
to retrieve another service by its path. `setup` is a great way to connect services:

```js
var todoService = {
  get: function(name, params, callback) {
    callback(null, {
      id: name,
      description: 'You have to ' + name + '!'
    });
  }
};

var myService = {
  setup: function(app) {
    this.todo = app.lookup('todo');
  },

  get: function(name, params, callback) {
    this.todo.get('take out trash', {}, function(error, todo) {
      callback(null, {
        name: name,
        todo: todo
      });
    });
  }
}

feathers()
	.use('todo', todoService)
	.use('my', myService)
	.listen(8000);
```

You can see the combination when going to `http://localhost:8000/my/test`.

## Getting Real, Time

The secret ingredient to create real time applications using Feathers and SocketIO is the
`created`, `updated` and `removed` events every Feathers service automatically emits.
Here is another simple Todo service, that just passes the data through `create`:

```js
var feathers = require('feathers');

var todoService = {
  create: function(data, params, callback) {
    callback(null, data);
  }
};

var app = feathers()
	.configure(feathers.socketio())
	.use('todo', todoService)
	.listen(8000);
```

Lets make an HTML file that creates a new Todo using SocketIO every two seconds:

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');
  var counter = 0;

  // Create a new Todo every two seconds
  setInterval(function() {
    counter++;

    socket.emit('todo::create', {
      description: 'I have ' + counter + ' things to do!'
    }, {}, function(error, data) {
      console.log('Created: ', data);
    });
  }, 2000);
</script>
```

In another file we just listen to the `todo created` event and log it:

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('todo created', function(todo) {
    console.log(todo.description);
  });
</script>
```
When visiting both HTMl files in a browser at the same time you should see a new Todo being logged every
two seconds on both pages.


## Why Another NodeJS Framework?

We know... Oh God another bloody NodeJS framework! Yes we are also very tired of seeing all these NodeJS frameworks. All the rails clones are getting a bit boring and really aren't taking advantage of the real strengths of NodeJS. We wanted to take a different approach than every other framework we have seen, because we believe that data is core to the web and should be the core focus of web applications. 

We also think that your data resources can and should be encapsulated in such a way that they can be ultra scalable and self contained. The MVC pattern works well but it is becoming antiquated in today's web. Frankly you don't need it and they tend to become bloated.

With that being said there are some amazing frameworks already out there and we wanted to leverage the ideas that have been put into them, which is why Feathers is built on top of [Express](http://expressjs.com) and is inspired in part by [Sails](http://sailsjs.org), [Flatiron](http://flatironjs.org) and [Derby](http://derbyjs.com).
