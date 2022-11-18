---
outline: deep
---

# Hooks

## Generating a hook

A new hook can be generated via

```
npx feathers generate hook
```

## Hook name

The hook generator will first ask for a name. Based on the name it will create a kebab-cased filename in the `hooks/` folder that exports a camelCased hook function. For example a name of `my fancy Hook` will create a `src/my-fancy-hook.ts` file that exports a `myFancyHook` [hook function](../../api/hooks.md#hook-functions).

## Hook types

There are two hook types that can be generated.

<BlockQuote type="tip">

For more information see the [hooks API documentation](../../api/hooks.md).

</BlockQuote>

### Around hooks

[Around hooks](../../api/hooks.md#around) allow to control the entire `before`, `after` and `error` flow in a single function. An `around` hook is an `async` function that accepts two arguments:

- The [hook context](../../api/hooks.md#hook-context)
- An asynchronous `next` function. Somewhere in the body of the hook function, there is a call to `await next()`, which calls the `next` hooks OR the original function if all other hooks have run.

```ts
import type { HookContext, NextFunction } from '../declarations'

export const myFancyHook = async (context: HookContext, next: NextFunction) => {
  console.log(`Running hook ${name} on ${context.path}.${context.method}`)
  await next()
  // Do things after here
}
```

You can wrap the `await next()` in a `try/catch` block to also handle errors.

### Before, after, error

[Before, after or error hooks](../../api/hooks.md#before-after-and-error) are `async` functions that take the [hook context](#hook-context) as the parameter.

```ts
import type { HookContext } from '../declarations'

export const myFancyHook = async (context: HookContext) => {
  console.log(`Running hook ${name} on ${context.path}.${context.method}`)
}
```

## Context types

If the hook is for a specific service, you can pass the service as a generic to the [HookContext](./typescript.md#hook-context) type which will give you the correct types for [context.data](../../api/hooks.md#contextdata), [context.result](../../api/hooks.md#contextresult) and [context.params](../../api/hooks.md#contextparams):

```ts
import type { UserService } from '../services/users/users'
import type { HookContext } from '../declarations'

export const myFancyUserHook = async (context: HookContext<UserService>) => {
  console.log(`Running hook ${name} on ${context.path}.${context.method}`)
}
```

## Registering hooks

A generated hook can be registered as an [application hook](./application.md#application-hooks) or as a [service hook](./services.md#registering-hooks). Also see the [hook registration API documentation](../../api/hooks.md#registering-hooks).
