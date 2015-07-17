---
layout: quick-start
title: Quick Start
description: Build your first Feathers app in minutes using our quick start guide.
weight: 1
permalink: /quick-start/
---

## About Feathers

Feathers extends [Express 4](http://expressjs.com), one of the most popular web frameworks for [NodeJS](http://nodejs.org/). It makes it easy to create shared RESTful web services and real-time applications using SocketIO and several other NodeJS websocket libraries supported by [Primus](http://primus.io).

If you are not familiar with Express head over to the [Express Guides](http://expressjs.com/guide.html) to get an idea. Feathers works the exact same way and supports the same functionality except that

```js
var express = require('express');
var app = express();
```

is replaced with

```js
var feathers = require('feathers');
var app = feathers();
```

This means that you can literally drop Feathers into your existing Express 4 application and start adding new services right away without having to change anything.

The following guide will walk through creating a basic Todo REST and websocket API with Feathers. To get started, lets create a new folder and in it run

> `npm install feathers`

## Your first service

The most important concept Feathers adds to Express is that of *services*. Services can be used just like an Express middleware function but instead are JavaScript objects that provide at least one of the following methods:

```js
var myService = {
  find: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params, callback) {},
  update: function(id, data, params, callback) {},
  patch: function(id, data, params, callback) {},
  remove: function(id, params, callback) {},
  setup: function(app, path) {}
}
```

This object can be registered like `app.use('/my-service', myService)` which - if configured - makes it available as a REST endpoint at `/my-service` and also through websockets. As usual in NodeJS, `callback` has to be called with the error (if any) first and the data as the second parameter.

### Simple Todo

With those methods available we can implement a very basic Todo service that returns a single Todo using the id passed to the `get` method:

```js
// app.js
var feathers = require('feathers');
var app = feathers();
var todoService = {
  get: function(id, params, callback) {
    // Call back with no error and the Todo object
    callback(null, {
      id: id,
      text: 'You have to do ' + id + '!'
    });
  }
};

app.configure(feathers.rest())
  .use('/todos', todoService)
  .listen(3000);
```

After running

> `node app.js`

You can go to [localhost:3000/todos/dishes](http://localhost:3000/todos/dishes) and should see the following JSON response:

```js
{
  "id": "dishes",
  "text": "You have to do dishes!"
}
```

### CRUD Todos

You might have noticed that service methods mainly reflect basic [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) functionality. Following up is a longer example with comments for implementing a complete Todo service that manages all Todos in memory:

```js
// todos.js
module.exports = {
  // The current id counter
  id: 0,
  // An array with all todos
  todos: [],

  // Tries to get a single Todo by its id.
  // Throws an error if none can be found.
  getTodo: function(id) {
    var todos = this.todos;

    for(var i = 0; i < todos.length; i++) {
      if(todos[i].id === parseInt(id, 10)) {
        return todos[i];
      }
    }

    // If we didn't return yet we can throw an error
    throw new Error('Could not find Todo');
  },

  // Return all Todos
  find: function(params, callback) {
    callback(null, this.todos);
  },

  // Returns a single Todo by id
  get: function(id, params, callback) {
    try {
      callback(null, this.getTodo(id));
    } catch(error) {
      callback(error);
    }
  },

  // Create a new Todo
  create: function(data, params, callback) {
    // Increment the global ID counter and
    // use it as the Todos id
    data.id = this.id++;
    this.todos.push(data);
    callback(null, data);
  },

  // Update (replace) an existing Todo with new data
  update: function(id, data, params, callback) {
    try {
      var todo = this.getTodo(id);
      var index = this.todos.indexOf(todo);

      data.id = todo.id;
      // Replace all the data
      this.todos[index] = data;
      callback(null, data);
    } catch(error) {
      callback(error);
    }
  },

  // Extend the data of an existing Todo
  patch: function(id, data, params, callback) {
    try {
      var todo = this.getTodo(id);

      // Extend the existing Todo with the new data
      Object.keys(data).forEach(function(key) {
        if(key !== 'id') {
          todo[key] = data[key];
        }
      });

      callback(null, todo);
    } catch(error) {
      callback(error);
    }
  },

  // Remove an existing Todo by id
  remove: function(id, params, callback) {
    try {
      var todo = this.getTodo(id);
      var index = this.todos.indexOf(todo);

      // Splice it out of our Todo list
      this.todos.splice(index, 1);
      callback(null, todo);
    } catch(error) {
      callback(error);
    }
  }
}
```

The above example exports the service as a module from its own file, `todos.js`. This means that in  `app.js` we can replace the previous `todoService` with loading that module. In order to parse JSON encoded HTTP bodies we additionally need to install and load the Express [body-parser](https://github.com/expressjs/body-parser):

> `npm install body-parser`

```js
// app.js
var feathers = require('feathers');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = require('./todos');

app.configure(feathers.rest())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .listen(3000);
```

Running `app.js` will now provide a fully functional REST API at `http://localhost:3000/todos`. We can test it, for example, using the [Postman](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?hl=en) REST client plugin for Google chrome or via CURL:


<blockquote><pre>curl 'http://localhost:3000/todos/' -H 'Content-Type: application/json' --data-binary '{ "text": "You have to do dishes!" }'</pre></blockquote>

The functionality provided by our service is quite common which is why we implemented the same thing and published it as the [feathers-memory](https://github.com/feathersjs/feathers-memory) module.

## Getting real-time

As previously mentioned, a Feathers service can also be exposed through websockets. You can either use [SocketIO](http://socket.io) or [Primus](https://github.com/primus/primus) - an abstraction layer for differentNode websocket libraries. In the following examples we will use SocketIO.

SocketIO can be enabled by calling `app.configure(feathers.socketio())`. Once set up, it is possible to call service methods by emitting events like `<servicepath>::<methodname>` on the socket and also receive events by listening to `<servicepath> <eventname>` (*eventname* can be `created`, `updated`, `patched` or `removed`). To make it easier to test in a web page, lets also statically host the files in the current folder. `app.js` then looks like this:

```js
// app.js
var feathers = require('feathers');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = require('./todos');

app.configure(feathers.rest())
  .configure(feathers.socketio())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname))
  .listen(3000);
```

That's it. Our application is now real-time, all we have to do is provide a nice frontend.

## Building a frontend

### Feathers client

[feathers-client]() is a JavaScript client that can connect to Feathers services either via REST (using jQuery.ajax, node-request or Superagent) or websockets (Socket.io and Primus). That makes it possible to use

### Testing the connection

To test the connection, we can create an `index.html` file in the same folder. The example page will connect to SocketIO, create a new Todo and also log when any Todo has been created, updated or patched:

```html
<!DOCTYPE HTML>
<html>
<head>
  <title>Feathers SocketIO example</title>
</head>
<body>
  <h1>A Feathers SocketIO example</h1>
  <pre id="log"></pre>

  <script src="/socket.io/socket.io.js"></script>
  <script type="text/javascript">
    // Connect to SocketIO on the same host
    var socket = io.connect();

    // This lets us log messages and JSON on the page
    var logElement = document.getElementById('log');
    var log = function(message, data) {
      logElement.innerHTML = logElement.innerHTML + '\n'
        + message + '\n' + JSON.stringify(data, null, '  ');
    }

    // Listen to all the service events
    socket.on('todos created', function(todo) {
      log('Someone created a new Todo:', todo);
    });

    socket.on('todos updated', function(todo) {
      log('Someone updated a Todo', todo);
    });

    socket.on('todos patched', function(todo) {
      log('Someone patched a Todo', todo);
    });

    socket.on('todos removed', function(todo) {
      log('Someone deleted a Todo', todo);
    });

    // Create a new Todo and then log all Todos from the server
    socket.emit('todos::create', {
      text: 'You have to do something real-time!'
    }, {}, function(error, todo) {
      log('Created Todo', todo);
      socket.emit('todos::find', {}, function(error, todos) {
        log('Todos from server:', todos);
      });
    });
  </script>
</body>
</html>
```

After restarting, going directly to [localhost:3000](http://localhost:3000) with the console open will show what is happening on the HTML page. You can also see the newly created Todo at the REST endpoint [localhost:3000/todos](http://localhost:3000/todos). With the page open, creating a new Todo via the REST API, for example

<blockquote><pre>curl 'http://localhost:3000/todos/' -H 'Content-Type: application/json' --data-binary '{ "text": "Do something" }'</pre></blockquote>

will also log `Someone created a new Todo`. This is how you can implement real-time functionality in any web page by using standardized websocket messages instead of having to make up your own.

**[Learn more](/learn)**
