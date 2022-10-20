---
outline: deep
---

# Overview of FeathersJS

Feathers is a framework for building modern APIs. But that doesn't mean much. Lots of frameworks let you build "modern APIs". But Feathers is unique. 

## The HTTP/Realtime Framework

In 2014, Feathers became the first framework to treat real-time APIs as first-class citizens together with HTTP requests, at the same time! Feathers was the first popular framework that allowed handling HTTP and WebSocket requests using the same code. Years later, Feathers is still the leading framework for real-time API support.

But what makes Feathers different?  How does it fit compared to other classifications of API frameworks? Let's review the most common types. We'll keep this brief so you can get to the fun part: building APIs with FeathersJS.

## Types of APIs

There are so many frameworks out there. Most fit into one of these types of APIs: Model-View-Controller (MVC), Remote Procedure Call (RPC), or GraphQL. There are others, for sure, but most APIs seem to fall into one of these categories.

### Remote Procedure Call (RPC)

Some of the first web APIs were built with RPC. Depending on implementation, RPC functions can be like little independent "microservices". They're pretty easy to begin using. If you can write a function, you can build with RPC, which is both "a gift and a curse". There are infinite ways to implement a function, and with RPC you might end up needing to figure out your own patterns. However, there are some great, well-structured RPC frameworks out there. We agree with many of their strong points.

### RESTful MVC

The MVC structure seems to be the most implemented. Being implemented in many Express and KoaJS apps, it has served many pages very well - pun intended. MVC is a structure that's common across many languages, not just in JavaScript frameworks. In our experience, most of these APIs follow a subset of REST. We can see why the pattern is popular, but to some people it doesn't make sense to build a modern API on MVC. We agree on this point, while also valuing and loving RESTful APIs.

### GraphQL

GraphQL APIs are comparatively new and have really grown in popularity. GraphQL APIs are certainly flexible. The query syntax is lovely, being able to fetch multiple types of data in a single request. The power of GraphQL does come with a decent amount of manual boilerplate. But, especially when used for federation, it's hard to argue against the power of resolvers. We appreciate the great design decisions in GraphQL.

## And Then There's FeathersJS

Feathers is a clean mix of the best features of RPC, MVC, and GraphQL. 

### Feathers and RPC

Feathers services are kind of like creating an interface composed of 6 RPC functions: `find`, `get`, `create`, `update`, `patch`, and `remove`. Feathers' standardized service interface brings superpowers in reusability and layerability. Feathers Database Adapters implement this service interface across dozens of different databases. Like RPC, you can also create individual, custom functions.

### Feathers and RESTful MVC

Feathers is RESTful, so it's the most similar to RESTful MVC. It's built around the concept of "services" which allow retrieving, modifying and removing data. However, apart from being RESTful, Feathers is nothing like MVC. ;) Thanks to its middleware layer, called **Feathers Hooks**, Feathers is **RESTful Aspect Oriented Programming (AOP)**, and we believe it's a much better fit for a modern API.

### Feathers and GraphQL

In Feathers v5, we've admittedly stolen some of our favorite features found in GraphQL. Resolvers are an amazing fit for a Rest API. And we now have Feathers Schemas for validations and TypeScript types. 

Our `feathers-batch` plugin gives you the benefit of retrieving from multiple different services in a single request, but without the tighter coupling of services to queries like with GraphQL. You make individual, separate requests to each service, and the `feathers-batch` plugin will combine the requests for you and return the responses to the correct place, like magic!

Another feature we're stealing from GraphQL is the query syntax, but in a way that more naturally fits the Feathers Query syntax. This new syntax will be powered by resolvers and the new `feathers-dataloader` plugin. These features are currently in closed beta and will become available in future minor releases of Feathers v5.


## The Decoupled Framework

Early versions of FeathersJS relied on ExpressJS for the underlying HTTP layer. As a testament to our preference for clean architecture, simple innovations we implemented in the Feathers Application Core were backported by the Express team into Express, itself.

One of Feathers greatest strengths is that it abstracts away the underlying framework implementing clean patterns on top. For example, instead of using Koa or Express middleware to handle HTTP requests, we create adapters that abstract away the framewwork middleware as much as possible. Decoupling from HTTP framework middleware allowed us another super-power: Cross-Transport Middleware.

Once we're free of framework middleware, we can then pipe the requests into Feathers Hooks (our clean, powerful, declarative, and flexible middleware layer).  When you use Feathers hooks, if you want to add real-time WebSockets, later, it's two lines of code. Requests that come in across WebSockets also implement an adapter that pipes the request into Feathers Hooks. These clean code patterns allow for loose coupling and a high degree of code reusability.

## The Pattern Framework

Having learned from our successes with decoupling and adapting APIs, we've continued to apply clean patterns and abstractions at every level of a Feathers app:

- **Feathers Services** standardize around REST, while also supporting custom, RPC-like methods. They use the same API on the server and client and provide the foundation for the rest of the Feathers APIs.
- **Feathers Service Adapters** implement integrations with third-party APIs and databases, all powered by the Feathers Service interface. Our `@feathersjs/adapter-commons` includes a test suite to assure that common funcionality just works across all databases or even other remote APIs. We support the most common databases directly in Feathers core, and there are dozens of other databases supported in community-maintained packages. There are even community adapters for sending mail with Postmark (or others) or performing financial transactions with Stripe. Interfaces are powerful, and the Feathers Service interface is a testament to their power.
- **Feathers Transport Adapters** feed any network protocol into Feathers Hooks.
- **Feathers Realtime Adapters** can dispatch events for any real-time publishing system. Support for Socket.io is bundled into Feathers core. The pattern could work equally well for MQTT and the "Internet of Things".
- **Feathers Hooks** are the middleware layer for Feathers services, handling queries, data, results, and events. They are universal "middleware", and can be used on any function, object methods, or class methods. They're not limited to just network requests.
- **Feathers Resolvers** (new in v5) use a universal utility for acting on attributes in queries, data, results, and events.
- **Feathers Queries** provide 90% of needed database interactivity, using the same syntax for all databases.
- **Feathers Schemas** (also new in v5) provide a uniform validation API and can adapt to your chosen validation framework. The ones built into the v5 generator are TypeScript friendly, generating types from the provided schemas. They also work on client and are ultra portable, supporting serialization into the JSON Schema format.
- **Feathers Authentication** sets up JWT-based authentication using any network transport. If you need better security than what JWT offers, there are community plugins strong enough to use for a cryptocurrency wallet.
- **Feathers OAuth** is provides OAuth login for popular providers, and it works for both KoaJS and Express.
- **Feathers Configuration** uses node config under the hood to support multiple environment configurations and environment variables.
- **Feathers Errors** is a typed set of error messages which can be used throughout an application.

This means that the code in a Feathers application generally looks the same no matter which HTTP or WebSocket framework it runs on. This is even more true when using the new Schemas, Resolvers, and OAuth plugins in Feathers v5.

## The Joy of FeathersJS

Since Feathers is different than what most people are accustomed to, it has a learning curve. Most people report overthinking Feathers due to experience with previous frameworks. Once it clicks, they see the value of the APIs and how friendly they are for new developers. You really notice the value of Feathers when you later try to build without it and basically end up rebuilding Feathers on top of another framework just to get the healthy patterns back!

With the release of Feathers v5 Dove, we are more enthusiastic than ever about the future of the framework. The latest APIs have been used and iterated on for over a year and have matured well to be a natural fit.  We are so excited to see what you'll build with it.

## What's Next?

Whether you're new to Feathers or a veteran, we recommend going through the [Getting Started guide](./basics/starting.md). For those who have prior FeathersJS experience, take a look at the [What's New in Dove](./whats-new-in-dove.md) page and the [Migration Guide](./migrating.md).

