---
layout: page
title: Docs
description: View the beautiful API for docs Feathers all in one place.
permalink: /docs/
weight: 4
---

This is the Feathers API documentation and details on configuration, service implementation and events.

## Configuration

### REST

In almost every case you want to expose your services through a RESTful JSON interface. This can be achieved by calling `app.configure(feathers.rest())`. Note that you will have to provide your own body parser middleware like the standard [Express 4 body-parser](https://github.com/expressjs/body-parser) to make REST `.create`, `.update` and `.patch` calls pass the parsed data.

To set service parameters in a middleware, just attach it to the `req.feathers` object which will become the params for any service call. It is also possible to use URL parameters for REST API calls which will also be added to the params object:

```js
var bodyParser = require('body-parser');

app.configure(feathers.rest())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .use(function(req, res, next) {
    req.feathers.data = 'Hello world';
    next();
  });

app.use('/:app/todos', {
  get: function(name, params, callback) {
    console.log(params.data); // -> 'Hello world'
    console.log(params.app); // will be `my` for GET /my/todos/dishes
    callback(null, {
      id: name,
      params: params,
      description: "You have to do " + name + "!"
    });
  }
});
```

The default REST handler is a middleware that formats the data retrieved by the service as JSON. If you would like to configure your own `handler` middleware just pass it to `feathers.rest(handler)`. For example, a middleware that just renders plain text with the todo description (`res.data` contains the data returned by the service):

```js
app.configure(feathers.rest(function restFormatter(req, res) {
    res.format({
      'text/plain': function() {
        res.end('The todo is: ' + res.data.description);
      }
    });
  }))
  .use('/todo', {
    get: function (id, params, callback) {
      callback(null, { description: 'You have to do ' + id });
    }
  });
```

If you want to add other middleware *before* the REST handler, simply call `app.use(middleware)` before configuring the handler.

### SocketIO

To expose services via [SocketIO](http://socket.io/) call `app.configure(feathers.socketio())`. It is also possible pass a `function(io) {}` when initializing the provider where `io` is the main SocketIO object. Since Feathers is only using the SocketIO default configuration, this is a good spot to initialize the [recommended production settings](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#recommended-production-settings):

```js
app.configure(feathers.socketio(function(io) {
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file

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

> Note: io.set is deprecated in Socket.IO 1.0. The above configuration will still work but will be replaced with the recommended production configuration for version 1.0 (which isn't available at the moment).

This is also the place to listen to custom events or add [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing):

```js
app.configure(feathers.socketio(function(io) {
  io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

  io.use(function (socket, next) {
    // Authorize using the /users service
    app.service('users').find({
      username: socket.request.username,
      password: socket.request.password
    }, next);
  });
}));
```

Similar than the REST middleware, the SocketIO socket `feathers` property will be extended
for service parameters:

```js
app.configure(feathers.socketio(function(io) {
  io.use(function (socket, next) {
    socket.feathers.user = { name: 'David' };
    next();
  });
}));

app.use('todos', {
  create: function(data, params, callback) {
    // When called via SocketIO:
    params.user // -> { name: 'David' }
  }
});
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

Just like REST and SocketIO, the Primus request object can be extended with a `feathers` parameter during authorization which will extend the `params` for any service request:

```js
app.configure(feathers.primus({
  transformer: 'sockjs'
}, function(primus) {
  // Set up Primus authorization here
  primus.authorize(function (req, done) {
    req.feathers = {
      user: { name: 'David' }
    }

    done();
  });
}));
```

## API

### listen

`app.listen([port])` starts the application on the given port. It will first call the original [Express app.listen([port])](http://expressjs.com/api.html#app.listen), then run `app.setup(server)` (see below) with the server object and then return the server object.

### setup

`app.setup(server)` is used to initialize all services by calling each services `.setup(app, path)` method (if available).
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

You can use the [vhost](https://github.com/expressjs/vhost) middleware to run your Feathers app on a virtual host:

```js
var vhost = require('vhost')

app.use('/todos', todoService);

var host = feathers().use(vhost('foo.com', app));
var server = host.listen(8080);

// Here we need to call app.setup because .listen on our virtal hosted
// app is never called
app.setup(server);
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

`app.service(path [, service])` does two things. It either returns the Feathers wrapped service object for the given path or registers a new service for that path.

`app.service(path)` returns the wrapped service object for the given path. Feathers internally creates a new object from each registered service. This means that the object returned by `service(path)` will provide the same methods and functionality as your original service object but also functionality added by Feathers and its plugins (most notably it is possible to listen to service events). `path` can be the service name with or without leading and trailing slashes.

```js
app.use('/my/todos', {
  create: function(data, params, callback) {
    callback(null, data);
  }
});

var todoService = app.service('my/todos');
// todoService is an event emitter
todoService.on('created', function(todo) {
  console.log('Created todo', todo);
});
```

You can use `app.service(path, service)` instead `app.use(path, service)` if you want to be more explicit that you are registering a service. It is what is called internally by `app.use([path], service)` if a service object is being passed. `app.service` does __not__ provide the Express `app.use` functionality and does not check the service object for valid methods.

## Services

As mentioned, the basic Feathers functionality is fully compatible with Express. The key concept added to that of middleware is *service* objects. A service can be any JavaScript object that offers one or more of the `find`, `get`, `create`, `update`, `remove` and `setup` service methods with the following signatures:

```js
var myService = {
  find: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params, callback) {},
  update: function(id, data, params, callback) {},
  patch: function(id, data, params, callback) {},
  remove: function(id, params, callback) {},
  setup: function(app) {}
}
```

And can be used like any other Express middleware `app.use('/my-service', myService)`.

All service callbacks follow the `function(error, data)` NodeJS convention. `params` can contain any additional parameters, for example the currently authenticated user. REST service calls set `params.query` with the query parameters (e.g. a query string like `?status=active&type=user` becomes `{ query: { status: "active", type: "user" } }`), socket call parameters will also be passed as `params.query`.

It is also possible to return a [Promise](http://promises-aplus.github.io/promises-spec/) object from a service instead of using the callback, for example using [Q](https://github.com/kriskowal/q):

```js
var Q = require('q');

var todos = {
  get: function(id) {
    var dfd = Q.defer();

    setTimeout(function() {
      dfd.resolve({
        id: id,
        description: 'You have to do ' + id
      });
    }, 500);

    return dfd.promise;
  }
}
```

### find

`find(params, callback)` retrieves a list of all resources from the service. SocketIO parameters will be passed as `params.query` to the service.

__REST__

    GET todo?status=completed&user=10

__SocketIO__

```js
socket.emit('todo::find', {
  status: 'completed'
  user: 10
}, function(error, data) {
});
```

> Will call .create with `params` { query: { status: 'completed', user: 10 } }

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

### patch

`patch(id, data, params, callback)` patches the resource identified by `id` using `data`. The callback should be called with the updated resource data. Implement `patch` additionally to `update` if you want to separate between partial and full updates and support the `PATCH` HTTP method.

__REST__

    PATCH todo/2
    { "description": "I really have to do laundry" }

__SocketIO__

```js
socket.emit('todo::patch', 2, {
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
    this.todo = app.service('todo');
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

Bind the apps `service` method to your service to always look your services up dynamically:

```js
var myService = {
  setup: function(app) {
    this.service = app.service.bind(app);
  },

  get: function(name, params, callback) {
    this.service('todos').get('take out trash', {}, function(error, todo) {
      callback(null, {
        name: name,
        todo: todo
      });
    });
  }
}
```

## Events

Any registered service will be automatically turned into an event emitter that emits events when a resource has changed, that is a `create`, `update` or `remove` service call returned successfully. It is therefore possible to bind to the below events via `app.service(servicename).on()` and, if enabled, all events will also broadcast to all connected SocketIO clients in the form of `<servicepath> <eventname>`. Note that the service path will always be stripped of leading and trailing slashes regardless of how it has been registered (e.g. `/my/service/` will become `my/service`).

### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```js
app.use('/todos', {
  create: function(data, params, callback) {
    callback(null, data);
  }
});

app.service('/todos').on('created', function(todo) {
  console.log('Created todo', todo);
});

app.service('/todos').create({
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

### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

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

app.service('/todos').remove(1, {}, function(error, callback) {
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

### Event filtering

By default all service events will be dispatched to all connected clients.
In many cases you probably want to be able to only dispatch events for certain clients.
This can be done by implementing the `created`, `updated`, `patched` and `removed` methods as `function(data, params, callback) {}` with `params` being the parameters set when the client connected, in SocketIO when authorizing and setting `socket.feathers` and Primus with `req.feathers`.

```js
var myService = {
  created: function(data, params, callback) {},
  updated: function(data, params, callback) {},
  patched: function(data, params, callback) {},
  removed: function(data, params, callback) {}
}
```

The event dispatching service methods will run for every connected client. Calling the callback with data (that you also may modify) will dispatch the according event. Callling back with a falsy value will prevent the event being dispatched to this client.

The following example only dispatches the Todo `updated` event if the authorized user belongs to the same company:

```js
app.configure(feathers.socketio(function(io) {
  io.use(function (socket, callback) {
    // Authorize using the /users service
    app.service('users').find({
      username: socket.request.username,
      password: socket.request.password
    }, function(error, user) {
      if(!error || !user) {
        return callback(new Error('Not authenticated!'));
      }

      socket.feathers = {
        user: user
      };

      callback();
    });
  });
}));

app.use('todos', {
  update: function(id, data, params, callback) {
    // Update
    callback(null, data);
  },

  updated: function(todo, params, callback) {
    // params === socket.feathers
    if(todo.companyId === params.user.companyId) {
      // Dispatch the todo data to this client
      return callback(null, todo);
    }

    // Call back with a falsy value to prevent dispatching
    callback(null, false);
  }
});
```

On the client:

```js
socket.on('todo updated', function(data) {
  // The client will only get this event
  // if authorized and in the same company
});
```
