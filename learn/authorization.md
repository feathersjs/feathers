---
layout: page
title: Authorization
description: Learn how to authorize users
hide: true
---

Authorization is the process of determining after [successful authentication](/learn/authentication) if the user is allowed to perform the requested action. This is again where [hooks](learn/validation#hooks) come in handy.

## User authorization

Since *feathers-passport* adds the authenticated user information to the service call parameters we can just check those in the hook and return with an error if the user is not authorized:

```js
app.service('todos').before({
  create: function(hook, next) {
    // We only allow creating todos with an authenticated user
    if(!hook.params.user) {
      return next(new Error('You need to be authenticated'));
    }

    // Check if the user belongs the `admin` group
    var groups = hook.params.user.groups;
    if(groups.indexOf('admin') === -1) {
      // Return with an error if not
      return next(new Error('User is not allowed to create a new Todo'));
    }

    // Otherwise just continue on to the
    // next hook or the service method
    next();
  }
});
```

## Event filtering

This is also a good time to talk a little about [filtering events](/api/#event-filtering). It is very likely that you eventually only want to send certain events to specific users instead of everybody. Following up on the group authorization example from above, we might only want to dispatch a `todos created` event to users that are in the admin group. This can be done by adding a `created(data, params, callback)` method to the Todo MongoDB service:

```js
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
}).extend({
  created: function(data, params, callback) {
    // Only dispatch if we have a user and user belongs to the admin group
    if(params.user && params.user.groups.indexOf('admin') !== -1) {
      // Call back with the data we want to dispatch
      return callback(null, data);
    }

    // Call back with falsy value to not dispatch the event
    callback(null, false);
  }
});
```

The `created` method is being called for every connected user with the `params` set in the `request.feathers` object and the data from the event. You can either call back with the original  or modified data (which will then be dispatched to that user) or a falsy value which will prevent the event from being dispatched to that connection.
