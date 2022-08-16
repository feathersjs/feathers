---
outline: deep
---

# What's New in v5

Feathers Dove (v5) is a super-ambitious release which adds some really great tooling and APIs. Here is an overview of each new feature, followed by links to learn more.

## New TypeScript Benefits

Feathers has been a TypeScript-friendly framework for years, but TypeScript support took a huge leap forward with Feathers Dove.

### Complete TypeScript Rewrite

We've completely rewritten all of Feathers in TypeScript. And we're not talking about a lightweight TypeScript implementation. It's TypeScript all the way down. Everything from the official database adapters, built-in hooks, and utilities, right down to Feathers core. The newly-rebuilt [v5 CLI and generator](#rebuilt-cli) even produces a TypeScript application, by default.

### Typed Client

Feathers has had an isomorphic API - working equally well in browser and server - since 2016. Now with Dove, our [new CLI](#rebuilt-cli) generates **shared types for the Feathers server and client**. We even integrated the types with our new [schemas feature](#official-schemas), so you define your types once, in a single location, and use them everywhere.

`<snark>`We're also happy to announce that FeathersHQ didn't have to borrow $40 million from investors to implement this awesome new feature. How did we ever manage to build such a great framework without millions of dollars?`</snark>` Really, we have a wondeful, active community of contributors who share values of good API design, boilerplate elimination, and making development fun.

Thanks to FeathersJS's clean, modular, loose-coupled architecture, it was pleasantly simple to add this feature. This is another one of the benefits we get from building a pattern-driven framework.

## Framework Agnostic API

In 2016, we realized that we could decouple Feathers from the underlying HTTP transport, resulting in our first framework-agnostic, isomorphic build. As of Feathers v5, we now support three ways of using Feathers:

- The Feathers client, which provides the same API in the browser and in Node.js.
- The [KoaJS transport](/api/koa) (new in Feathers Dove)
- The [ExpressJS transport](/api/express)

It's possible to create other framework integrations using the Koa transport as a template. For example, you could make an adapter for the popular framework, Fastify (but with the new Feathers [router](#lightning-fast-routing), you really don't need to).

### KoaJS Support

but the CLI's official HTTP integration has always been built on the Express adapter. Lately, Express has been "showing its age", so we've made some inviting changes.

- We've released the [`@feathersjs/koa`](/api/koa) adapter and utilities. Now Feathers apps can use [KoaJS](https://koajs.com/) as an API base.
- The Feathers CLI now uses KoaJS as the default transport.
- The Express adapter will continue to function alongside KoaJS.

FeathersJS has its own, isomorphic middleware layer, based on [`@feathersjs/hooks`](https://www.github.com/feathersjs/hooks), so you likely won't need to tap into the middleware layer of any framework adapter. But, in those rare cases that you do need framework middleware, it's available to you.

### Lightning-Fast Routing

Feathers just got a huge speed upgrade, now including its own Radix Trie router. This means that the algorithm behind Fastify's speed is now built into Feathers, and it works no matter which framework transport you use under the hood. (This is why there's not really a need to build a Fastify transport for Feathers, unless you want to use some other Fastify API under the hood.)

The best part about the new router is that there's not another API you have to learn in order to use Feathers. It just works.

For those who want to build a custom framework transport, there's a single [`.lookup` method](/api/application#lookup) you can use to route requests through Feathers.

### Service De-registration

Now that Feathers comes with [its own router](#lightning-fast-routing), it's possible to de-register a service to completely remove it from the application. This allows you to build cleaner, dynamically generated applications. This is a coveted feature for those who want to build, for example, a dynamic CRUD admin application that's driven by some sort of schema.

<BlockQuote type="danger" label="todo">

Work on this feature is still pending. [issue](https://github.com/feathersjs/feathers/issues/2035)

</BlockQuote>

## Custom Methods

Custom Method creation is one of the most-requested features for Feathers. Feathers Dove introduces an elegant solution for custom methods on top of the Feathers service interface.

When you define your service class, you can specify additional methods on the class to create an internal-only method. To expose the method to the public API, add the method's name to the `methods` options when registering the service. Custom methods are similar to the `create` method, so you can POST to them when using HTTP-based adapters.

Read more about custom methods, [here](/api/services#custom-methods).

## Resolvers

Feathers just inherited one of GraphQL's best features: Resolvers! Let's take a look at some of the advantages.

### Resolver Advantages

Feathers Resolvers offer several advantages.

- Bring GraphQL's powerful resolver API into your Feathers app.
- Keep using Feathers' REST-based patterns and loosely-coupled, modular architecture.
- Eliminate most of the boilerplate associated with manually-wiring up queries and mutations, which we can do because of Feathers' focused attention on smart code patterns.
- Paired with [custom methods](#custom-methods), you still have the power to manually wire up custom resolvers to custom service methods.

### Resolver Utility Hooks

Resolvers are powered by new hook utilities:

- [resolveData](/api/schema/resolvers#data-resolvers) for incoming data.
- [resolveResult](/api/schema/resolvers#result-resolvers) for results coming from databases or other services
- [resolveDispatch](/api/schema/resolvers#safe-data-resolvers) for cleanly defining safe data for WebSocket / Real-time events.
- [resolveQuery](/api/schema/resolvers#query-resolvers) for incoming query parameters
- [resolveAll](/api/schema/resolvers#resolveall) to cleanly wrap the previous four utilities into a tool that handles 90% of resolver use cases.

The new CLI builds new services with `resolveAll`, enabling all resolvers in a single, clean function call.

#### Benefits of Resolver Hook Utils

These new hook utils allow you to

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

### Where to Populate Data

<BlockQuote type="danger" label="todo">

// TODO: Fill out this section once the new data-loader is finished.

</BlockQuote>

## More Powerful Hooks

In Feathers Dove there are now two hook formats. One for `before`, `after`, and `error` hooks, and a new one for `around` hooks:

- **Before, after, and error hooks** have been Feathers' most-used API for years.
  - Are registered as `before`, `after`, or `error` hooks in the hook object.
  - Continue to work fully in Feathers Dove.
  - Are less powerful than the new "around" hooks, but visually simpler.
  - In some cases offer more granular control over hook flow than `around` hooks.
- **Around Hooks** are new in Feathers Dove.
  - Are registered in the `around` key of a hook object.
  - Are capable of handling before, after, and error logic, all within a single hook.
  - Have a slightly different function definition than before, after, and error hooks
  - Are more powerful yet also more visually complex (The "after" part of each hook runs in reverse-registered order).

Let's compare the signature of the two types of hooks.

### Before, After, & Error Hooks

Let's look at an example of the before/after/error hook format. These hooks receive the `context` as their only argument. They return either the `context` object or `undefined`.

```ts
import type { HookContext } from '../../declarations'

export const myHook = async (context: HookContext) => {
  return context
}
```

You can learn more about before/after/error hooks, [here](/api/hooks#before-after-and-error)

### Around Hooks

Now let's see an around hook. An around hook receives two arguments: the `context` object and a `next` function.

```ts
import type { HookContext, NextFunction } from '../../declarations'

export const myHook = async (context: HookContext, next: NextFunction) => {
  await next()
}
```

You can learn more about around hooks, [here](/api/hooks#around)

### Registering Hooks

The hooks object now has a new `around` property, which is specifically for `around` hooks. Since around hooks have different function signatures, they are not interchangeable with before/after/error hooks.

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
  // before/after/error hooks also continue to work
  before: {},
  after: {},
  error: {}
}
```

Learn more about registering hooks, [here](/api/hooks#registering-hooks).

### When to use Around Hooks

Using `around` hooks or `regular` hooks is mostly a matter of preference. There's no imminent need to rewrite all of your regular hooks into around hooks. Both hooks work together, as explained [here](/api/hooks#hook-flow).

Starting with Dove, the CLI templates and new tooling features are written in `around` hooks. The around hooks simplify code in core tools because we can keep the logic for the entire hook flow (before, after, error) all in one file.

Here are a couple of examples of where `around` hooks work really well:

<BlockQuote type="details" label="Data Caching Example">

One great use case for `around` hooks is data caching. A caching hook typically has the following responsibilities:

- Check the cache for existing results. (before the service method executes)
- Push new results into the cache, once received. (after the service method executes)
- Handle and report errors which occur in the hook.

With regular hooks, a cache hook has to be split into three parts, one for each responsibility. Instead, a single `around` hook can handle everything on its own.

Below is an example of an overly-simple cache hook using JavaScript's `Map` API. Everything before `await next()` runs before the database call. Everything afterwards runs after the database call. You could also drop in a try/catch to handle possible errors.

```ts
import type { HookContext, NextFunction } from '../../declarations'

export const simpleCache = new Map()

export const myHook = async (context: HookContext, next: NextFunction) => {
  // Check the cache for an existing record
  const existing = simpleCache.get(context.id)

  // If an existing record was found, set it as context.result to skip the database call.
  if (existing) {
    context.result = existing
  }

  await next()

  // Cache the latest record by its id
  simpleCache.set(context.result.id, context.result)
}
```

</BlockQuote>

<BlockQuote type="details" label="The resolveAll hook">

A real-life use case for around hooks is the `resolveAll` hook, which comes with [`@feathersjs/schema`](/api/schema/schema). The `resolveAll` hook takes all of the different types of resolvers and makes sure they execute in the correct order. The hooks API made it really clean to write.

Once you've learned the basics about resolvers on this page, you can find more information about `resolveAll`, [here](/api/schema/resolvers#resolveAll).

</BlockQuote>

## Official Schemas

Feathers Dove (v5) introduces new, official tools for data validation and mutation in the new core package, [@feathersjs/schema](/api/schema/index). This same package includes schema-based resolvers, which you'll learn about in the next section.

Schemas are powered by JSON Schema (an IETF standard) which makes them powerful and portable. While Read more about schemas, [here](/api/schema/schema)

### Schema-Driven Types

One of the problems we wanted to avoid was the need to define schemas and/or types in multiple places. If we had a motto/slogan for types, it would be

**"Define it once, use it everywhere."**

So in Feathers Dove, when you create a schema, it dynamically generates proper TypeScript types. We were able to accomplish this thanks to the excellent package [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts).

### Configuration Schemas

If you've ever experienced pains of deploying to production, you'll appreciate this feature.

So now when your app starts in production, all of your environment variables are checked against the configuration schema. The app won't start if the schema validation fails. This will alleviate occurrence of those pesky bugs in production days to weeks after deployment, all because of a missing environment variable.

Configuration schemas also produce TypeScript types, so the [TypeScript improvements](#new-typescript-benefits) in Feathers Dove include typed configuration lookup for `app.get()` and `app.set()`. It's really convenient.

Read more about configuration schemas, [here](/api/configuration#configuration-schema)

## Rebuilt CLI

The new CLI is completely different under the hood, and very familiar on the surface. There are a few differences in file structure compared to apps generated with previous versions of the CLI.

### State of the Art

When creating the new generator, we looked at open-source generators already available. We were very impressed with [Hygen](https://hygen.io). It's absolutely impressive work, for sure, so we even wrote a custom generator to try it out. Then [@fratzinger](https://github.com/fratzinger) came up with the idea of a 100% TypeScript-based generator. We couldn't find an existing project, so we made one!

When we say "state of the art", it's not hubris. The new Feathers CLI is built on top of [Pinion](https://github.com/feathershq/pinion), our own generator with TypeScript-based templates. Instead of using some custom templating language, like Handlebars or EJS, Pinion uses Typed [Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), providing some wonderful benefits:

- No more mystery context. You always know the exact context of the templates and what helpers are available.
- It just works™️ with existing npm packages. There's no need to make an EJS plugin for some custom helper using an obscure API. Just import the module and use it in your template.
- Integrates with all existing TypeScript tooling. Hover over a variable and inspect the context like you would any TS code.

Now that we have what we consider the best generator on the planet, we have some exciting future plans for the Feathers CLI. Stay tuned!

### Fully TypeScript

We have dramatically reduced the surface area for bugs to be introduced into the app. We've committed 100% to TypeScript, while making sure that you can still generate a JavaScript app.

When you select `JavaScript` to generate an app, the CLI works some magic under the hood by

- compiling the `.ts` templates to JavaScript, in memory
- formatting the JavaScript code with Prettier
- writing clean `.js` to the file system.

And we get to smile because the entire process is a work of art, thanks to the TypeScript team.

For Feathers Maintainers, commiting to TypeScript means we only contribute to a single set of templates. and they get magically compiled - on the fly - to plain JavaScript when you want it.

### Shared Types

We covered this [in more detail, earlier](#typed-client), but it's worth briefly mentioning again. The new generator powers Shared Types for both the Feathers server and client. You can make your public-facing API easier to use and give developers a typed client.

### New App Structure

The file and folder structure of generated apps has changed a little bit. Here's an overview of the changes:

- Each service has its own schemas file.
- Each service has its own resolvers file.
- The service hooks are now found together with the service class. So now you see all of a service's logic in one place.
- The `src/models` folder no longer gets created, since [Feathers schemas](#official-schemas) replace models.
- Each service has its own folder inside the `tests` folder.

You can learn more about the generated files, [here](/guides/cli/structure)

## `setup` and `teardown`

Feathers v5 Dove adds built-in support for app-level `setup` and `teardown` hooks. They are special hooks that don't run on the service level but instead directly on `app.setup` and `app.teardown`. They allow you to perform some async logic while starting and stopping the Feathers server.

```ts
app.hooks({
  setup: [connectMongoDB],
  teardown: [closeMongoDB]
})
```

Learn more about `setup` and `teardown` hooks, [here](/api/hooks#setup-and-teardown)
