# Feathers

> Let your web app fly.

[![Build Status](https://travis-ci.org/feathersjs/feathers.png)](https://travis-ci.org/feathersjs/feathers)

Feathers is a light weight web application framework that rides on top of [Express](http://expressjs.com). It makes it easy to create RESTful web services and real-time applications using [socket.io](http://socket.io).

The core focus of Feathers is **your data**. We believe that ultimately your app's purpose is to manage data in some fashion and so that's all you should really need to deal with. Managing your data.

## Install

As with any NodeJS module, just install it as a dependency in your application:

> npm install feathers --save

## Getting Started Is Easy

Building an app with Feathers is easy. There are only 4 things to worry about. A wrapped express server, providers, services & middleware. Services are just simple modules that expose certain methods to the providers in order to CRUD your data. We can easily initialize a service that say... provides a single Todo:

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
	.use('/todo', todoService)
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

## What's next?

Head over to the Feathers website at [feathersjs.com](http://feathersjs.com/) for more examples and the detailed documenation.