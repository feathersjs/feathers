---
outline: deep
---

# Troubleshooting

## TypeScript-related issues

TypeScript provides many benefits, but it also introduces its own set of issues to a codebase. Here are some TypeScript-related issues that can come up while developing Feathers apps.

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
