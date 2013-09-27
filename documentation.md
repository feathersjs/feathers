## Introduction

Feathers sits right on top of Express, one of the most popular web frameworks for NodeJS. If you are not familiar with Express head over to the [Express Guides](http://expressjs.com/guide.html). Feathers works the exact same way except that `var app = require('express')();` is replaced with `var app = require('feathers')()`. The small differences and additional functionality available is outline in the following documentation.

## Configuration

### REST

Exposing services through a RESTful JSON interface is enabled by default. If you only want to use SocketIO
call `app.disabled('feathers rest')` _before_ registering any services.

### SocketIO

To expose services via [SocketIO](http://socket.io/) call `app.configure(feathers.socketio())`. It is also possible pass a `function(io) {}` when initializing the provider where `io` is the main SocketIO object so you can listen to custom events, change the configuration or add [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing):

```js
app.configure(feathers.socketio(function(io) {
  io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

  io.set('authorization', function (handshakeData, callback) {
    app.lookup('users').find({
      username: handshakeData.username,
      password: handshakeData.password
    }, callback);
  });
}));
```

Once the server has been started with `app.listen()` the SocketIO object is available as `app.io`.

## API

### listen

`app.listen([port])` starts the application on the given port. Before calling the original [Express app.listen([port])](http://expressjs.com/api.html#app.listen) Feathers will initialize the SocketIO server (if set up) and call all services `setup(app, path)` methods in the order they have been registered.

```js
var app = feathers();
app.use('/todos', {
  setup: function(app, path) {
    // path -> 'todos'
  }
});

var server = app.listen(8080);

server.close();
```

### lookup

`app.lookup(path)` returns the wrapped service object for the given path. Note that the returned object will provide the same methods and functionality as the original service but actually is a new object with additional functionality added (most notably it is possible to listen to service events). `path` can be the service name with or without leading and trailing slashes.

```js
app.use('/my/todos', {
  create: function(data, params, callback) {
    callback(null, data);
  }
});

var todoService = app.lookup('my/todos');
// todoService is an event emitter
todoService.on('created', function(todo) {
  console.log('Created todo', todo);
});
```

### use

`app.use([path], service)` works just like [Express app.use([path], middleware)](http://expressjs.com/api.html#app.use) but additionally allows to register a service object (an object which at least provides one of the service methods as outlined in the Services section) instead of the middleware function. Note that REST services are registered in the same order as any other middleware so the below example will allow the `/todos` service only to [Passport](http://passportjs.org/) authenticated users.

```js
// Serve public folder for everybody
app.use(feathers.static(__dirname + '/public');
// Make sure that everything else only works with authentication
app.use(function(req,res,next){
  if(req.isAuthenticated()){
    next();
  } else {
    // 401 Not Authorized
    next(new Error(401));
  }
});
// Add a service.
app.use('/todos', {
  get: function(name, params, callback) {
    callback(null, {
      id: name,
      description: "You have to do " + name + "!"
    });
  }
});
```

## Services

A service can be any JavaScript object that offers one or more of the `find`, `get`, `create`, `update`, `remove` and `setup` service methods:

```js
var myService = {
  find: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params, callback) {},
  update: function(id, data, params, callback) {},
  remove: function(id, params, callback) {},
  setup: function(app) {}
}
```

All callbacks follow the `function(error, data)` NodeJS convention. `params` can contain any additional parameters, for example the currently authenticated user. REST service calls set `params.query` with the query parameters (e.g. a query string like `?status=active&type=user` becomes `{ status: "active", type: "user" }`).

### find

`find(params, callback)` retrieves a list of all resources from the service. Ideally use `params.query` for things like filtering and paging so that REST calls like `todo?status=completed&user=10` work right out of the box.

__REST__

    GET todo?status=completed&user=10

__SocketIO__

```js
socket.emit('todo::find', {
  query: {
    status: 'completed'
    user: 10
  }
}, function(error, data) {
});
```

### get

`get(id, params, callback)` retrieves a single resource with the given `id` from the service.

__REST__

    GET todo/1

__SocketIO__

```js
socket.emit('todo::get', 1, {}, function(error, data) {

});
```

### create

`create(data, params, callback)` creates a new resource with `data`. The callback should be called with the newly
created resource data.

__REST__

    POST todo
    { "description": "I really have to iron" }

By default the body can be eihter JSON or form encoded as long as the content type is set accordingly.

__SocketIO__

```js
socket.emit('todo::create', {
  description: 'I really have to iron'
}, function(error, data) {
});
```

### update

`update(id, data, params, callback)` updates the resource identified by `id` using `data`. The callback should
be called with the updated resource data.

__REST__

    PUT todo/2
    { "description": "I really have to do laundry" }

__SocketIO__

```js
socket.emit('todo::update', 2, {
  description: 'I really have to do laundry'
}, {}, function(error, data) {
  // data -> { id: 2, description: "I really have to do laundry" }
});
```

### remove

`remove(id, params, callback)` removes the resource with `id`. The callback should be called with the removed resource.

__REST__

    DELETE todo/2

__SocketIO__

```js
socket.emit('todo::remove', 2, {}, function(error, data) {
});
```

### setup

`setup(app, path)` initializes the service passing an instance of the Feathers application and the path it has been registered on. The SocketIO server is available via `app.io`. `setup` is a great way to connect services:

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

__Pro tip:__

Bind the apps `lookup` method to your service to always look your services up dynamically:

```
var myService = {
  setup: function(app) {
    this.lookup = app.lookup.bind(app);
  },

  get: function(name, params, callback) {
    this.lookup('todos').get('take out trash', {}, function(error, todo) {
      callback(null, {
        name: name,
        todo: todo
      });
    });
  }
}
```

## Events

Any registered service will be automatically turned into an event emitter that emits events when a resource has changed, that is a `create`, `update` or `remove` service call returned successfully. It is therefore possible to bind to the below events via `app.lookup(servicename).on()` and, if enabled, all events will also broadcast to all connected SocketIO clients in the form of `<servicepath> <eventname>`.

### created

The `created` event will be published with the callback data when a service `create` calls back successfully.

```js
app.use('/todos', {
  create: function(data, params, callback) {
    callback(null, data);
  }
});

app.lookup('/todos').on('created', function(todo) {
  console.log('Created todo', todo);
});

app.lookup('/todos').create({
  description: 'We have to do something!'
}, {}, function(error, callback) {
  // ...
});

app.listen(8000);
```

__SocketIO__

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('todos created', function(todo) {
    console.log('Got a new Todo!', todo);
  });
</script>
```

### updated

The `updated` event will be published with the callback data when a service `update` calls back successfully.

```js
app.use('/todos', {
  update: function(id, data, params, callback) {
    callback(null, data);
  }
});

app.lookup('/todos').on('updated', function(todo) {
  console.log('Updated todo', todo);
});

app.listen(8000);
```

__SocketIO__

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.emit('todos::update', 1, {
    description: 'Updated description'
  }, {}, function(error, callback) {
   // Do something here
  });

  socket.on('todos updated', function(todo) {
    console.log('Got an updated Todo!', todo);
  });
</script>
```

### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```js
app.use('/todos', {
  remove: function(id, params, callback) {
    callback(null, { id: id });
  }
});

app.lookup('/todos').remove(1, {}, function(error, callback) {
  // ...
});

app.listen(8000);
```

__SocketIO__

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('todos removed', function(todo) {
    // Remove element showing the Todo from the page
    $('#todo-' + todo.id).remove();
  });
</script>
```

## Why?

We know... Oh God another NodeJS framework! Yes we are also very tired of seeing all these NodeJS frameworks. All the rails clones are getting a bit boring and really aren't taking advantage of the real strengths of NodeJS. We wanted to take a different approach than every other framework we have seen, because we believe that data is core to the web and should be the core focus of web applications.

We also think that your data resources can and should be encapsulated in such a way that they can be ultra scalable and self contained. The MVC pattern works well but it is becoming antiquated in today's web. Frankly you don't need it and they tend to become bloated.

With that being said there are some amazing frameworks already out there and we wanted to leverage the ideas that have been put into them, which is why Feathers is built on top of [Express](http://expressjs.com) and is inspired in part by [Sails](http://sailsjs.org), [Flatiron](http://flatironjs.org) and [Derby](http://derbyjs.com).

## Changelog

__0.2.0__

- Pre-initialize `req.feathers` in REST provider to set service parameters
- Allowing to initialize services with or without slashes to be more express-compatible

__0.1.0__

- First beta release
- Directly extends Express
- Removed built in services and moved to [Legs](https://github.com/feathersjs/legs)
- Created [example repository](https://github.com/feathersjs/examples)

__0.0.x__

- Initial test alpha releases

## License

Copyright (C) 2013 David Luecke daff@neyeon.com
Copyright (C) 2013 Eric Kryski e.kryski@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
