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

As previously mentioned, a Feathers service can also be exposed through websockets for both real-time updates and to call service methods. You can either use [SocketIO](http://socket.io) or [Primus](https://github.com/primus/primus) - an abstraction layer for different Node websocket libraries. In the following examples we will use SocketIO.

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

Feathers works great with [any frontend framework](/learn/), Android or iOS clients or anything else that can connect to a REST API or websockets (to get real-time). We have real-time [TodoMVC](http://todomvc.com/) examples for [jQuery](/todomvc/feathers/jquery/guide.html), [Angular](/todomvc/feathers/angularjs/guide.html), [React](/todomvc/feathers/react/guide.html) and [CanJS](/todomvc/feathers/canjs/guide.html) but for this guide, we will create a more simplified jQuery client.

### Feathers client

We could connect with any REST client or send our own websocket events but [feathers-client](https://github.com/feathersjs/feathers-client) makes it much easier. It is a JavaScript client that can connect to Feathers services either via REST (using jQuery.ajax, node-request or Superagent) or websockets (Socket.io and Primus) and lets you use services the same way you would on the server. You can install it via Bower, [download the release]() or install via NPM which is what we will use:

```
npm install feathers-client
```

Since we also set statically hosting the files in the current folder in the previous chapter, we can now create an `index.html` that loads the client, connects to our Todos service via Socket.io, creates a test todo and logs when a new todo has been created:

```html
<!DOCTYPE HTML>
<html>
<head>
  <title>Feathers SocketIO example</title>
</head>
<body>
  <h1>A Feathers SocketIO example</h1>

  <script src="/socket.io/socket.io.js"></script>
  <script src="/node_modules/feathers-client/dist/feathers.js"></script>
  <script>
    var socket = io();
    var app = feathers().configure(feathers.socketio(socket));
    var todos = app.service('todos');

    todos.on('created', function(todo) {
      console.log('Todo created', todo.text);
    });

    todos.create({
      text: 'Todo from client',
      complete: false
    });
  </script>
</body>
```

After restarting, going directly to [localhost:3000](http://localhost:3000) with the console open will show what is happening on the HTML page. You can also see the newly created Todo at the REST endpoint [localhost:3000/todos](http://localhost:3000/todos). With the page open, creating a new Todo via the REST API, for example

<blockquote><pre>curl 'http://localhost:3000/todos/' -H 'Content-Type: application/json' --data-binary '{ "text": "Do something" }'</pre></blockquote>

will also log `Someone created a new Todo` with. This is how you can implement real-time functionality in any web page. All that's left now is using jQuery to listen to those events to update the list and the ability to remove and create todos.

### jQuery frontend

Let's update `index.html` to load [Bootstrap](http://getbootstrap.com/) and [jQuery](https://jquery.com) and also create an HTML form and placeholder where the Todos will go:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Feathers real-time Todos</title>
  <link href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <style type="text/css">
    .done {
      text-decoration: line-through;
    }
  </style>

  <div class="container" id="todos">
    <h1>Feathers real-time Todos</h1>

    <ul class="todos list-unstyled"></ul>
    <form role="form" class="create-todo">
      <div class="form-group">
        <input type="text" class="form-control" name="description" placeholder="Add a new Todo">
      </div>
      <button type="submit" class="btn btn-info col-md-12">Add Todo</button>
    </form>
  </div>

  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
  <script src="node_modules/feathers-client/dist/feathers.js"></script>
  <script src="/socket.io/socket.io.js"></script>
  <script src="todo-client.js"></script>
</body>
```

In `todo-client.js` we now have to connect to the service again and add jQuery code that adds, removes and updates todos. To identify a Todo we'll store the `data-id="<id>"` property on the todos `<li>` and retrieve it with `getElement(todo)`:

```js
var el = $('#todos');
var socket = io();
var app = feathers().configure(feathers.socketio(socket));
var todos = app.service('todos');


function getElement(todo) {
  return el.find('[data-id="' + todo.id + '"]')
}

function addTodo(todo) {
 var html = '<li class="page-header checkbox" data-id="' + todo.id + '">' +
       '<label><input type="checkbox" name="done">' +
       todo.text +
       '</label><a href="javascript://" class="pull-right delete">' +
       '<span class="glyphicon glyphicon-remove"></span>' +
       '</a></li>';

 el.find('.todos').append(html);
 updateTodo(todo);
}

function removeTodo(todo) {
 getElement(todo).remove();
}

function updateTodo(todo) {
 var element = getElement(todo);
 var checkbox = element.find('[name="done"]').removeAttr('disabled');

 element.toggleClass('done', todo.complete);
 checkbox.prop('checked', todo.complete);
}
```

We can use the Todo service to listen to `created`, `updated` and `removed` events and call the appropriate functions that we just created. We will also initially load all existing Todos:

```js
todos.on('updated', updateTodo);
todos.on('removed', removeTodo);
todos.on('created', addTodo);

todos.find(function(error, todos) {
  todos.forEach(addTodo);
});
```

Now we can add the jQuery event handlers when submitting the form, removing a Todo or completing it by clicking the checkbox. We only need to call the service method since the updates will happen automatically already through the service event handlers that we set up previously:

```js
el.on('submit', 'form', function (ev) {
   var field = $(this).find('[name="description"]');

   todos.create({
     text: field.val(),
     complete: false
   });

   field.val('');
   ev.preventDefault();
 });

 el.on('click', '.delete', function (ev) {
   var id = $(this).parents('li').data('id');
   todos.remove(id);
   ev.preventDefault();
 });

 el.on('click', '[name="done"]', function(ev) {
   var id = $(this).parents('li').data('id');

   $(this).attr('disabled', 'disabled');

   todos.update(id, {
     complete: $(this).is(':checked')
   });
 });
 ```

Now go to [http://localhost:3000](http://localhost:3000) and you will be able to create, complete and remove todos and it will update on all clients in real-time.

## What's next?

This are the basics of Feathers. We created a todos API that is accessible via REST and websockets and built a real-time jQuery frontend. Now, head over to the **[Learn section](/learn)** to learn more about things like Databases, how to integrate other frontend frameworks, Validation, Authentication or Authorization and get familiar with the **[API documentation](/api/)**.
