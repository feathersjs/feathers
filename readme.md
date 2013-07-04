# Feathers

> An ultra scalable, feather weight, data oriented framework built for tomorrow's web.

[![Build Status](https://travis-ci.org/yycjs/feathers.png)](https://travis-ci.org/yycjs/feathers)

The core focus of Feathers is **your data**. We believe that ultimately your app's purpose is to manage data in some fashion and so that's all you should really need to deal with. Managing your data. Feathers provides a deadly simple way of managing your data and allows you to provide this data via REST and SocketIO APIs with NodeJS.

## Why Another NodeJS Framework?

We know... Oh God another bloody NodeJS framework! Yes we are also very tired of seeing all these NodeJS frameworks. All the rails clones are getting a bit boring and really aren't taking advantage of the real strengths of NodeJS. We wanted to take a different approach than every other framework we have seen, because we believe that data is core to the web and should be the core focus of web applications. 

We also think that your data resources can and should be encapsulated in such a way that they can be ultra scalable and self contained. The MVC pattern works well but it is becoming antiquated in today's web. Frankly you don't need it and they tend to become bloated.

With that being said there are some amazing frameworks already out there and we wanted to leverage the ideas that have been put into them, which is why Feathers is built on top of [Express](http://expressjs.com) and is inspired in part by [Sails](http://sailsjs.org), [Flatiron](http://flatironjs.org) and [Derby](http://derbyjs.com).


## Key Concepts

At the core to Feathers are 3 simple but important concepts, **Providers**, **Services** and **Mixins**.

A **Provider** is simply a module that *provides* your data to clients (ie. via REST or Web Sockets).

A **Service** is a module that defines the API functionality for a given resource and is exposed to clients via a provider. (ie. A definition of create, update, etc.)

A **Mixin** is like a utility or middleware that you can use to improve your service (ie. validation or authentication)

## Getting Started is Easy

Like we said, services are just simple modules that expose certain methods to the providers. This makes it easy to initialize a service that say... provides a single TODO:

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

feathers.createServer({ port: 8000 })
	.service('todo', todoService)
	.provide(feathers.rest())
	.provide(feathers.socketio())
	.start();
```

That's all there really is to building an app with Feathers.


## Built In Providers

### REST

You can access the REST service by going to `http://localhost:8000/todo/dishes` in your browser
and will see:

```js
{
  "id": "dishes",
  "description": "You have to do dishes!"
}
```

### SocketIO

Since, in the above example, you added it as a provider, you can also connect to your service via SocketIO.
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
  setup: function(server) {}
}
```

All callbacks follow the `function(error, data)` NodeJS convention. `params` contains additional
parameters like the query parameters of a REST API call. For example `http://localhost:8000/todo/dishes?done=true`
from the getting started example would result in `{ done: 'true' }` as the `params` object.

### find(params, callback)

Retrieves a list of all resources of the service. `params` contains additional parameters such
as URL query parameters (like `http://localhost:8000/todo?sort=status`).

### get(id, params, callback)

Retrieves a single resource of the service. `params` contains additional parameters such
as URL query parameters (like `http://localhost:8000/todo?sort=status`).

### create(data, params, callback)

### update(id, data, params, callback)

### remove(id, params, callback)

### setup(registry)

## Built In Services

To make it easier to get started, Feathers comes with several standard service implementations to extend
from. All built in services follow the same parameter conventions for things like sorting and filtering.

### Memory

### MongoDB (TODO)

### Redis (TODO)

## Service mixins

### Event

### Association

### Validation

### Authentication
