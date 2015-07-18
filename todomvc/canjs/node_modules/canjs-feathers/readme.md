# CanJS Feathers

[![Build Status](https://travis-ci.org/feathersjs/canjs-feathers.png?branch=master)](https://travis-ci.org/feathersjs/canjs-feathers)

CanJS model implementation that connects to Feathers services through [feathers-client](https://github.com/feathersjs/feathers-client).

## Getting Started

Use NPM

    npm install canjs-feathers

Or Bower to install the package

    bower install canjs-feathers

Or [download the JavaScript](https://github.com/feathersjs/canjs-feathers/archive/master.zip) and put it in your CanJS project folder. Use it with any module loader (AMD or CommonJS) or without via the global `canFeathers` method.

### Set up a connection

CanJS models can be created by passing a Feathers client. You can use any connector supported by feathers-client (jQuery, Request, Superagent, Socket.io or Primus). First, either load or include the feathers-client and canjs-feathers JavaScript:

```html
<script type="text/javascript" src="node_modules/feathers-client/dist/feathers.js"></script>
<script type="text/javascript" src="node_modules/canjs-feathers/dist/canjs-feathers.js"></script>
```

```js
var feathers = require('feathers-client');
var canFeathers = require('canjs-feathers');
```

Let's use Socket.io for the example:

```js
// Connect to the Socket
var socket = io();
// Create feathers-client application connecting to the socket
var app = feathers().configure(feathers.socketio(socket));

// Pass the app to get a base model
var Model = canFeathers(app);
// Then extend it with `resource` set to the service name.
var Todo = Model.extend({
  resource: 'todos'
}, {});
```

Then we can use it like any other CanJS model:

```js
var myTodo = new Todo({
  text: 'A Todo',
  complete: false
});

myTodo.save().then(function() {
  myTodo.attr('text', 'Update Todo');
  myTodo.save();
});
```

## Authors

- [David Luecke](https://github.com/daffl)
- [Marshall Thompson](https://github.com/marshallswain)

## License

Copyright (c) 2015 David Luecke

Licensed under the [MIT license](LICENSE).
