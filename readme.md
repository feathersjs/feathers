## Introduction

Feathers is a light weight web application framework that rides on top of [Express](http://expressjs.com), one of the most popular web frameworks for [NodeJS](http://nodejs.org/). It makes it easy to create RESTful web services and real-time applications using SocketIO and several other NodeJS real-time libraries.

If you are not familiar with Express head over to the [Express Guides](http://expressjs.com/guide.html) to get an idea. Feathers works the exact same way except that `var app = require('express')();` is replaced with `var app = require('feathers')()`. The most important concept that Feathers adds to Express middleware is data oriented **Services**. How services work and the API additional to the available [Express API](http://expressjs.com/api.html) is outlined in the following documentation.

## Configuration

### REST

Exposing services through a RESTful JSON interface is enabled by default. If you only want to use SocketIO call `app.disabled('feathers rest')` _before_ registering any services.

To set service parameters in a middleware, just attach it to the `req.feathers` object which will become the params for any resulting service call:

```js
app.use(function(req, res) {
  req.feathers.data = 'Hello world';
});

app.use('/todos', {
  get: function(name, params, callback) {
    console.log(params.data); // -> 'Hello world'
    callback(null, {
      id: name,
      params: params,
      description: "You have to do " + name + "!"
    });
  }
});
```

### SocketIO

To expose services via [SocketIO](http://socket.io/) call `app.configure(feathers.socketio())`. It is also possible pass a `function(io) {}` when initializing the provider where `io` is the main SocketIO object. Since Feathers is only using the SocketIO default configuration, this is a good spot to initialize the [recommended production settings](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#recommended-production-settings):

```js
app.configure(feathers.socketio(function(io) {
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging

  // enable all transports (optional if you want flashsocket support, please note that some hosting
  // providers do not allow you to create servers that listen on a port different than 80 or their
  // default port)
  io.set('transports', [
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
}));
```

This is also the place to listen to custom events or add [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing):

```js
app.configure(feathers.socketio(function(io) {
  io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

  io.set('authorization', function (handshakeData, callback) {
    // Authorize using the /users service
    app.lookup('users').find({
      username: handshakeData.username,
      password: handshakeData.password
    }, callback);
  });
}));
```

Once the server has been started with `app.listen()` the SocketIO object is available as `app.io`.

### Primus

[Primus](https://github.com/primus/primus) is a universal wrapper for real-time frameworks and allows you to transparently use Engine.IO, WebSockets, BrowserChannel, SockJS and Socket.IO. Set it up with `feathers.primus(configuration [, fn])` where `configuration` is the [Primus server configuration](https://github.com/primus/primus#getting-started) and `fn` an optional callback with the Primus server instance that can e.g. be used for setting up [authorization](https://github.com/primus/primus#authorization):

```js
// Set up Primus with SockJS
app.configure(feathers.primus({
  transformer: 'sockjs'
}, function(primus) {
  // Set up Primus authorization here
  primus.authorize(function (req, done) {
    var auth;

    try { auth = authParser(req.headers['authorization']) }
    catch (ex) { return done(ex) }

    // Do some async auth check
    authCheck(auth, done);
  });
}));
```

In the Browser you can connect like this:

```html
<script type="text/javascript" src="primus/primus.js"></script>
<script type="text/javascript">
  var primus = new Primus(url);

  primus.on('todos created', function(todo) {
    console.log('Someone created a Todo', todo);
  });

  primus.send('todos::create', { description: 'Do something' }, {}, function() {
    primus.send('todos::find', {}, function(error, todos) {
      console.log(todos);
    });
  });
</script>
```

## API

### listen

`app.listen([port])` starts the application on the given port. It will first call the original [Express app.listen([port])](http://expressjs.com/api.html#app.listen), then run `app.setup(server)` (see below) with the server object and then return the server object.

### setup

`app.setup(server)` is used initialize all services by calling each services `.setup(app, path)` method (if available).
It will also use the `server` instance passed (e.g. through `http.createServer`) to set up SocketIO (if enabled) and any other provider that might require the server instance.

Normally `app.setup` will be called automatically when starting the application via `app.listen([port])` but there are cases when you need to initialize the server separately:

__HTTPS__

With your Feathers application initialized it is easy to set up an HTTPS REST and SocketIO server:

```js
app.configure(feathers.socketio()).use('/todos', todoService);

var https = require('https');
var server = https.createServer({
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
}, app).listen(443);

// Call app.setup to initialize all services and SocketIO
app.setup(server);
```

__Virtual Hosts__

You can use `feathers.vhost` (which is the same as [Express and Connect .vhost](http://www.senchalabs.org/connect/vhost.html)) to run your Feathers app on a virtual host:

```js
app.use('/todos', todoService);

var host = feathers().use(feathers.vhost('foo.com', app));
var server = host.listen(8080);

// Here we need to call app.setup because .listen on our virtal hosted
// app is never called
app.setup(server);
```

### lookup

`app.lookup(path)` returns the wrapped service object for the given path. Note that Feathers internally creates a new object from each registered service. This means that the object returned by `lookup` will provide the same methods and functionality as the original service but also functionality added by Feathers (most notably it is possible to listen to service events). `path` can be the service name with or without leading and trailing slashes.

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

### service

`app.service([path], service)` is what is called internally by `app.use([path], service)` if a service object is being passed. Use it instead of `app.use([path], service)` if you want to be more explicit that you are registering a service. `app.service` does __not__ provide the Express `app.use` functionality and doesn't check the service object for valid methods.

## Services

A service can be any JavaScript object that offers one or more of the `find`, `get`, `create`, `update`, `remove` and `setup` service methods with the following signatures:

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

All callbacks follow the `function(error, data)` NodeJS convention. `params` can contain any additional parameters, for example the currently authenticated user. REST service calls set `params.query` with the query parameters (e.g. a query string like `?status=active&type=user` becomes `{ query: { status: "active", type: "user" } }`).

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
}, {}, function(error, data) {
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
      callback(error, {
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

Any registered service will be automatically turned into an event emitter that emits events when a resource has changed, that is a `create`, `update` or `remove` service call returned successfully. It is therefore possible to bind to the below events via `app.lookup(servicename).on()` and, if enabled, all events will also broadcast to all connected SocketIO clients in the form of `<servicepath> <eventname>`. Note that the service path will always be stripped of leading and trailing slashes regardless of how it has been registered (e.g. `/my/service/` will become `my/service`).

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
app.use('/my/todos/', {
  update: function(id, data, params, callback) {
    callback(null, data);
  }
});

app.listen(8000);
```

__SocketIO__

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('my/todos updated', function(todo) {
    console.log('Got an updated Todo!', todo);
  });

  socket.emit('my/todos::update', 1, {
    description: 'Updated description'
  }, {}, function(error, callback) {
   // Do something here
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

We know! Oh God another NodeJS framework! We really didn't want to add another name to the long list of NodeJS web frameworks but also wanted to explore a different approach than any other framework we have seen. We strongly believe that data is the core of the web and should be the focus of web applications.

We also think that your data resources can and should be encapsulated in such a way that they can be scalable, easily testable and self contained. The classic web MVC pattern used to work well but is becoming antiquated in today's web.

With that being said there are some amazing frameworks already out there and we wanted to leverage the ideas that have been put into them, which is why Feathers is built on top of [Express](http://expressjs.com) and is inspired in part by [Sails](http://sailsjs.org), [Flatiron](http://flatironjs.org) and [Derby](http://derbyjs.com).

## Changelog

__0.3.1__

- REST provider refactoring ([#35](https://github.com/feathersjs/feathers/pull/35)) to make it easier to develop plugins
- HTTP requests now return 405 (Method not allowed) when trying to access unavailable service methods ([#35](https://github.com/feathersjs/feathers/pull/35))

__0.3.0__

- Added [Primus](https://github.com/primus/primus) provider ([#34](https://github.com/feathersjs/feathers/pull/34))
- `app.setup(server)` to support HTTPS (and other functionality that requires a custom server) ([#33](https://github.com/feathersjs/feathers/pull/33))
- Removed bad SocketIO configuration ([#19](https://github.com/feathersjs/feathers/issues/19))
- Add .npmignore to not publish .idea folder ([#30](https://github.com/feathersjs/feathers/issues/30))
- Remove middleware: connect.bodyParser() ([#27](https://github.com/feathersjs/feathers/pull/27))

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
