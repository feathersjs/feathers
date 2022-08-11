---
outline: deep
---

# What's New in Dove

Feathers Dove (v5) adds some really great tooling and APIs. Here is a brief overview of each new concept followed by links to learn more.

## There's More to Hooks: Around vs Regular

In Feathers Dove there are now two hook formats. The "Regular" hooks:

- **Regular Hooks** have been Feathers' most-used API for years.
  - Are registered as `before`, `after`, or `error` hooks in the hook object.
  - Continue to work fully in Feathers Dove.
  - Are less powerful than the new "around" hooks, but visually simpler.
- **Around Hooks** are new in Feathers Dove.
  - Are registered in the `around` key of a hook object.
  - Are capable of handling `before`, `after`, and `error` logic, all within a single hook.
  - Have a slightly different function definition than Regular hooks
  - Are more powerful yet also more visually complex (The "after" part of each hook runs in reverse-registered order).

Let's compare the signature of the two types of hooks.

### Regular Hook Format

Let's look at an example of a regular hook. A regular hook receive the `context` as its only argument. It also returns the `context` object.

```ts
import type { HookContext } from '../../declarations'

export const myHook = async (context: HookContext) => {
  return context
}
```

### Around Hook Format

Now let's see an around hook. An around hook receives two arguments: the `context` object and a `next` function.

```ts
import type { HookContext, NextFunction } from '../../declarations'

export const myHook = async (context: HookContext, next: NextFunction) => {
  await next()
}
```

Keep in mind that

## Hooks vs Resolvers

Feathers Dove (v5) introduces new, official tools for data validation and mutation using [schemas](/api/schema/schema), and [resolvers](/api/schema/resolvers). These new tools are found in a new core package: [@feathersjs/schema](/api/schema/index).

## Where to Populate Data
