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

You can learn more about regular hooks, [here](/api/hooks#before-after-and-error)

### Around Hook Format

Now let's see an around hook. An around hook receives two arguments: the `context` object and a `next` function.

```ts
import type { HookContext, NextFunction } from '../../declarations'

export const myHook = async (context: HookContext, next: NextFunction) => {
  await next()
}
```

You can learn more about around hooks, [here](/api/hooks#around)

### Registering Hooks

The hooks object now has a new `around` property, which is specifically for `around` hooks. Since around hooks have different function signatures, they are not interchangeable with regular hooks.

```ts
export const serviceHooks = {
  // `around` hook are new in Feathers Dove
  around: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  // `regular` hooks also continue to work
  before: {},
  after: {},
  error: {}
}
```

Learn more about registering hooks, [here](/api/hooks#registering-hooks).

### Around or Regular Hooks?

Using `around` hooks or `regular` hooks is mostly a matter of preference. There's no imminent need to rewrite all of your regular hooks into around hooks. Both hooks work together, as explained [here](/api/hooks#hook-flow).

Starting with Dove, the CLI templates and new tooling features are written in `around` hooks. The around hooks simplify code in core tools because we can keep the logic for the entire hook flow (before, after, error) all in one file.

Here are examples of where `around` hooks work really well:

<BlockQuote type="details" label="Data Caching Example">

One great use case for `around` hooks is data caching. A caching hook typically has the following responsibilities:

- Check the cache for existing results. (before the service method executes)
- Push new results into the cache, once received. (after the service method executes)
- Handle and report errors which occur in the hook.

With regular hooks, a cache hook has to be split into three parts, one for each responsibility. Instead, a single `around` hook can handle everything on its own.

</BlockQuote>

<BlockQuote type="details" label="The resolveAll hook">

A real-life use case for around hooks is the `resolveAll` hook, which comes with [`@feathersjs/schema`](/api/schema/schema). The `resolveAll` hook takes all of the different types of resolvers and makes sure they execute in the correct order. The hooks API made it really clean to write.

Once you've learned the basics about resolvers on this page, you can find more information about `resolveAll`, [here](/api/schema/resolvers#resolveAll).

</BlockQuote>

## Official Schemas

Feathers Dove (v5) introduces new, official tools for data validation and mutation in the new core package, [@feathersjs/schema](/api/schema/index). This same package includes schema-based resolvers, which you'll learn about in the next section.

Schemas are powered by JSON Schema (an IETF standard) which makes them powerful and portable. While Read more about schemas, [here](/api/schema/schema)

## Schema-Based Resolvers

Resolvers elegantly integrate one best GraphQL features by the same name directly into Feathers. Resolvers are built on top of hooks and run in special hooks which allow you to

- More cleanly manage properties on incoming records, query objects, and/or results
- Perform advanced validation beyond what's possible with JSON Schema.
- More efficiently write code for populating relational data (often faster than an ORM can perform a complex SQL Join)
- Save yourself a lot of boilerplate compared to writing the three features, above, manually with hooks.

You can start using resolvers right away. The new [CLI](/guides/basics/services#generating-a-service) generates them with all new services. Resolvers are one of the new tools provided in the new core package: [@feathersjs/schema](/api/schema/index).

You can read more about resolvers, [here](/api/schema/resolvers).

### Hooks vs Resolvers

At first glance, it might seem complex now that there are multiple places where you could write the same functionality. Should the feature go into a hook or a resolver? Here are some general guidelines to assist you to pick:

- data manipulation and custom validation probably fit best in a resolver.
- adding or pulling in data from other sources will likely fit best in a resolver.
- side effects that affect `context.params` must happen in a hook, since the `context` objected is frozen inside of resolvers. This prevents race conditions and allows resolvers to run in parallel.
- Other side effects that manipulate external data will likely go into a hook with a few exceptions. If you need to do some logging, for example, based on an attribute in incoming data, you might consider putting that API request into a resolver. This situation could also work well in a hook.

## Where to Populate Data
