---
layout: page
title: Persisting to MongoDB
description: Learn how to connect to MongoDB
hide: true
---

Our CRUD Todo functionality implemented in the service is very common and doesn't have to be re-done from scratch every time. In fact, this is almost exactly what is being provided already in the [feathers-memory](https://github.com/feathersjs/feathers-memory) module.

## Setting up

Luckily we don't have to stop at storing everything in-memory. For the popular NoSQL database [MongoDB](http://mongodb.org) , for example, there already is the [feathers-mongodb](https://github.com/feathersjs/feathers-mongodb) module and if you need more ORM-like functionality through [Mongoose](http://mongoosejs.com/) you can also use [feathers-mongoose](https://github.com/feathersjs/feathers-mongoose).

> `npm install feathers-mongodb`

## MongoDB + Feathers

With a MongoDB instance running locally, we can replace our `todoService` in `app.js` with a MongoDB storage on the `feathers-demo` database and the `todos` collection like this:

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

And just like this we have a full REST and real-time Todo API that stores its data into MongoDB in just 16 lines of code! We will continue using MongoDB so we don't need our example `todos.js` service anymore.
