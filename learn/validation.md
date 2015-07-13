---
layout: page
title: Validation
description: Learn how to do Validation and data processing
hide: true
---

## Validation and processing

The next step is validating and processing our data. With the MongoDB service already implemented we have two options to extend its functionality.

### Service Extension

*feathers-mongodb* uses the ES5 inheritance library [Uberproto](https://github.com/daffl/uberproto). This allows us to `extend` the original object returned by the call to `mongodb(options)` and overwrite the existing implementation of `create` to process the Todo data and then pass it to the original (`_super`) method. This way we can also easily add our own methods to the service.

```js
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
}).extend({
  create: function(data, params, callback) {
    // We want to make sure that `complete` is always set
    // and also only use the `text` and `complete` properties
    var newData = {
      text: data.text,
      complete: data.complete === 'true' || !!data.complete
    };
    // Call the original method with the new data
    this._super(newData, params, callback);
  },

  // Add another method
  addDefaultTodo: function(callback) {
    this.create({
      text: 'The default todo',
      complete: false
    }, {}, callback);
  }
});
```

### Hooks

Another option is the [feathers-hooks](https://github.com/feathersjs/feathers-hooks) plugin which allows us to add asynchronous hooks before or after a service method call. Hooks work similar to Express middleware. The following example adds a hook that converts our Todo data and makes sure that nobody submits anything that we don't want to put into MongoDB:

> `npm install feathers-hooks`

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var hooks = require('feathers-hooks');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});

app.configure(feathers.rest())
  .configure(feathers.socketio())
  // Configure hooks
  .configure(hooks())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname))
  .listen(3000);

// Get the wrapped todos service object and
// add a `before` create hook modifying the data
app.service('todos').before({
  create: function(hook, next) {
    var oldData = hook.data;
    // Replace the old data by creating a new object
    hook.data = {
      text: oldData.text,
      complete: oldData.complete === 'true' || !!oldData.complete
    };
    next();
  }
});
```

You might have noticed the call to [.service](/api/#toc9) in `app.service('todos')`. This will basically return the original service object (`todoService` in our case) *but* contain some functionality added by Feathers. Most notably, the returned service object will be an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) that emits `created`, `updated` etc. events.

The *feathers-hooks* plugin also adds a `.before` and `.after` method that allows to add hooks to that service. When you need to access services, *always* use `app.service(name)` and not the original service object otherwise things will not work as expected.
