## Introduction

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

> GET todo?status=completed&user=10

__SocketIO__

```js
socket.emit('todo::find', {
  status: 'completed'
  user: 10
}, function(error, data) {
});
```

### get

`get(id, params, callback)` retrieves a single resource with the given `id` from the service.

__REST__

> GET todo/1

__SocketIO__

```js
socket.emit('todo::get', 1, {}, function(error, data) {

});
```

### create

`create(data, params, callback)` creates a new resource with `data`. The callback should be called with that resource (and the id initialized).

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

### update

`update(id, data, params, callback)` updates the resource identified by `id` using `data`.

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

### remove

`remove(id, params, callback)` removes the resource with `id`.

__REST__

> DELETE todo/2

__SocketIO__

```js
socket.emit('todo::remove', 2, {}, function(error, data) {
});
```

### setup

`setup(app)` initializes the service passing an instance of the Feathers application.
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

## Events

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

## Another Framework?

We know... Oh God another bloody NodeJS framework! Yes we are also very tired of seeing all these NodeJS frameworks. All the rails clones are getting a bit boring and really aren't taking advantage of the real strengths of NodeJS. We wanted to take a different approach than every other framework we have seen, because we believe that data is core to the web and should be the core focus of web applications.

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
