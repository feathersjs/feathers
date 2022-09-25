---
outline: deep
---

# Troubleshooting

## TypeScript-related issues

TypeScript provides many benefits, but it also introduces its own set of issues to a codebase. Here are some TypeScript-related issues that can come up while developing Feathers apps.

<BlockQuote label="TypeScript-Only Content">

Make sure the language in the sidebar is set to TypeScript while reading this section.  Some code blocks will appear empty in JavaScript mode.

</BlockQuote>

### Services - Registering

When registering a service, you might see an error where things just worked before.  Here's an example:

```ts
app.use('version', {
  async find() {
    return { v: 2 }
  }
})
```

The above code will produce a TypeScript error like this one:

> Argument of type '"version"' is not assignable to parameter of type '"authentication" | "users" | "tasks"'. ts(2345)

This error means that the the `version` service doesn't have a match in the `ServiceTypes` interface in the `declarations` file.  While it's certainly an option to go edit that file, there's a cleaner way to do it.  If you look at the bottom of a newly-generated `users` service file, you'll see a `declare` block that looks like this:

```ts
// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    users: UsersService
  }
}
```

This tells the TypeScript tooling that you expect `app.service('users')` to be of type `UsersService`.  So we need to do the same thing for our tiny new `version` service. We could do it the quick and dirty way and use the `any` type, like this:

```ts
// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    version: any
  }
}
```

And that would eliminate the error, but it's not a very clear definition. By more clearly defining what's going on, we can benefit from return types when we use the `find` method on this custom `version` service. So it would be more supportive to tell TypeScript that the `version` service has the following characteristics:

- Let's focus on the service object. It's an object with a `find` attribute: <br/>
   `{ find: any }`
- The `find` attribute is a method which accepts no arguments and when called it returns a Promise: <br/>
   `{ find: () => Promise<any> }`
- Now let's focus on the returned Promise. The Promise resolves to an object:  <br/>
   `Promise<{}>`
- The object contains a `v` attribute, which will hold a `number` value:  <br/>
   `Promise<{ v: number }>`
- When brought together it becomes this:  <br/>
   `{ find: () => Promise<{ v: number }> }`

So the above line is the official way of telling TypeScript that our `version` service is "an object with a find method that takes no arguments and returns a promise that resolves to an object with a `v` attribute containing a number." After writing that out, we're glad we can learn the shorter TypeScript syntax. :) 

So now we can tell TypeScript that `version` is a specific type:

```ts

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    version: { find: () => Promise<{ v: number }> }
  }
}
```

With the declaration in place, the error message will go away.

At sometime in the future, you might want to put a small service into another service's file. Suppose that the `version` path was actually going to be `users/version`, and we wanted to register it in the `users` service file. We could just update the declaration at the bottom of the file to look like this:

```ts
// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    users: UsersService
    version: { find: () => Promise<{ v: number }> }
  }
}
```

And now both services are declared inside a single interface.

### Hooks - No overload matches this call

You might see the error `No overload matches this call` when calling a service's `hooks` method. It will happen if any of the provided hooks are of the wrong type. The following code will trigger a TS error:

```ts
// Produces TS error because hooks should be async
app.service('users').hooks({
  around: {
    all: [
      (context: HookContext, next: NextFunction) => {
        next()
      }
    ]
  }
})
```

The above code fails because the hook is improperly defined. Hooks should be async, as shown here:

```ts
// This code will work, because the hook is defined correctly.
app.service('users').hooks({
  around: {
    all: [
      async (context: HookContext, next: NextFunction) => {
        await next()
      }
    ]
  }
})
```

## Schema Issues

### unknown keyword: "convert"

You see an error like `"Error: strict mode: unknown keyword: "convert"`.

See the solution on the [MongoDB Database Adapter](/api/databases/mongodb#unknown-keyword-convert) page.

### unknown format "date-time"

You see an error like `Error: unknown format "date-time" ignored in schema at path "#/properties/createdAt"`.

See the solution on the [MongoDB Database Adapter](/api/databases/mongodb#unknown-format-date-time) page.
