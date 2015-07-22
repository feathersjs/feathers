# Feathers - Build Better APIs, Faster than Ever

[![Join the chat at https://gitter.im/feathersjs/feathers](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/feathersjs/feathers?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/feathersjs/feathers-client.png?branch=master)](https://travis-ci.org/feathersjs/feathers-client)

Feathers is a real-time, micro-service web framework for NodeJS that gives you control over your data via RESTful resources, sockets and flexible plug-ins.

## Getting started

Visit the website at [feathersjs.com](http://feathersjs.com) to read the [Getting started guide](http://feathersjs.com/quick-start/) or learn how to build real-time applications with jQuery, Angular, React, CanJS, iOS, Android - you name it - and Feathers as the backend [in our guides](http://feathersjs.com/learn/).

## A MongoDB REST and real-time API

Curious how it looks? Here is a full REST and real-time todo API that uses MongoDB:

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});

app.configure(feathers.rest())
  .configure(feathers.socketio())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname))
  .listen(3000);
```

Then run

```
npm install feathers feathers-mongodb body-parser
node app
```

and go to [http://localhost:3000/todos](http://localhost:3000/todos). Don't want to use MongoDB? Feathers has plugins for [many other databases](http://feathersjs.com/learn/) and you can easily [write your own adapters](http://feathersjs.com/quick-start/).
