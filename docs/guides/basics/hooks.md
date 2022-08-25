---
outline: deep
---

# Hooks

As we have seen in the [quick start](./starting.md),  and when we created our messages service in [the previous chapter](./services.md), Feathers services are a great way to implement data storage and modification. Technically, we could write our entire app with services but very often we need similar functionality across multiple services. For example, we might want to check for all services a user is allowed to access. With just services, we would have to implement this every time.

This is where Feathers hooks come in. Hooks are pluggable middleware functions that can be registered __around__, __before__, __after__ or on __errors__ of a service method. Just like services themselves, hooks are *transport independent*. They are usually also service agnostic, meaning they can be used with ​*any*​ service. This pattern keeps your application logic flexible, composable, and much easier to trace through and debug.

<BlockQuote type="info">

A full overview of the hook API can be found in the [hooks API documentation](../../api/hooks.md).

</BlockQuote>

Hooks are commonly used to handle things like validation, authorization, logging, populating related entities, sending notifications and more.

<BlockQuote type="tip">

For the general design pattern behind hooks see [this blog post](https://blog.feathersjs.com/design-patterns-for-modern-web-apis-1f046635215). A more Feathers specific overview can be found [here](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).

</BlockQuote>

## Quick example

Here is a quick example for a hook that adds a `createdAt` property to the data before calling the actual `create` service method:



<LanguageBlock global-id="ts">

```ts
import { HookContext } from '@feathersjs/feathers';

const createdAt = async (context: HookContext) => {
  context.data.createdAt = new Date();

  return context;
};

app.service('messages').hooks({
  before: {
    create: [ createdAt ]
  }
});
```

</LanguageBlock>

<LanguageBlock global-id="js">

```js
const createdAt = async context => {
  context.data.createdAt = new Date();

  return context;
};

app.service('messages').hooks({
  before: {
    create: [ createdAt ]
  }
});
```

</LanguageBlock>



## Hook functions

A hook function is a function that takes the [hook context](#hook-context) as the parameter and returns that context or nothing. Hook functions run in the order they are registered and will only continue to the next once the current hook function completes. If a hook function throws an error, all remaining hooks (and the service call if it didn't run yet) will be skipped and the error will be returned.

A common pattern the generator uses to make hooks more reusable (e.g. making the `createdAt` property name from the example above configurable) is to create a wrapper function that takes those options and returns a hook function:



<LanguageBlock global-id="ts">

```ts
import { HookContext } from '@feathersjs/feathers';

const setTimestamp = (name: string) => {
  return async (context: HookContext) => {
    context.data[name] = new Date();

    return context;
  }
}

app.service('messages').hooks({
  before: {
    create: [ setTimestamp('createdAt') ],
    update: [ setTimestamp('updatedAt') ]
  }
});
```

</LanguageBlock>

<LanguageBlock global-id="js">

```js
const setTimestamp = name => {
  return async context => {
    context.data[name] = new Date();

    return context;
  }
}

app.service('messages').hooks({
  before: {
    create: [ setTimestamp('createdAt') ],
    update: [ setTimestamp('updatedAt') ]
  }
});
```

</LanguageBlock>



Now we have a reusable hook that can set the timestamp on any property.

## Hook context

The hook `context` is an object which contains information about the service method call. It has read-only and writable properties.

Read-only properties are:

- `context.app` - The Feathers application object. This can be used to e.g. call other services
- `context.service` - The service this hook is currently running on
- `context.path` - The path (name) of the service
- `context.method` - The service method name
- `context.type` - The hook type (`before`, `after` or `error`)

Writeable properties are:

- `context.params` - The service method call `params`. For external calls, `params` usually contains:
  - `context.params.query` - The query (e.g. query string for REST) for the service call
  - `context.params.provider` - The name of the transport (which we will look at in the next chapter) the call has been made through. Usually `rest`, `socketio`, `primus`. Will be `undefined` for internal calls.
- `context.id` - The `id` for a `get`, `remove`, `update` and `patch` service method call
- `context.data` - The `data` sent by the user in a `create`, `update` and `patch` service method call
- `context.error` - The error that was thrown (in `error` hooks)
- `context.result` - The result of the service method call (in `after` hooks)

> __Note:__ For more information about the hook context see the [hooks API documentation](../../api/hooks.md).

## Registering hooks

In a Feathers application generated by the CLI, hooks are being registered in a `.hooks` file in an object in the following format:



<LanguageBlock global-id="ts">

```ts
export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
```

</LanguageBlock>

<LanguageBlock global-id="js">

```js
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
```

</LanguageBlock>



This makes it easy to see at one glance the order hooks are executed and for which method.

> __Note:__ `all` is a special keyword which means those hooks will run before the method specific hooks in this chain.

## What's next?

In this chapter we learned how Feathers hooks can be used as middleware for service method calls to validate and manipulate incoming and outgoing data without having to change our service. We now have a fully working chat application. Before we [create a frontend for it](../frontend/javascript.md) though, let's first look at how [authentication works with Feathers](./authentication.md).
