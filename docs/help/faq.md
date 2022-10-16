---
outline: deep
---

# FAQ

We've been collecting some commonly asked questions here. We'll either be updating the guide directly, providing answers here, or both.

## Why should I use Feathers?

There are many other Frameworks that let you build web applications so this is definitely a justified question. The key part for Feathers is that it takes a different approach to both, traditional MVC frameworks like Rails, Sails or NestJS and low level HTTP frameworks like Sinatra, Express (with which Feathers is fully compatible), Hapi or Koa. Instead of creating routes, controllers and HTTP request and response handlers, Feathers uses services and workflows (hooks) that let you focus on your application logic independently from how it is being accessed.

This makes applications easier to understand and test and it allows Feathers to automatically provide REST APIs, websocket real-time APIs (which can often be quite a bit faster) and universal usage on the client and the server. It also makes it possible to add new communication protocols (like HTTP2 or GraphQL) without having to change anything in your application code. Feathers does all that while staying lightweight with a small API surface and codebase and flexible by letting you use it with the backend and frontend technology that best suits your needs.

For more information

- [Read about the philosophy behind Feathers and where it came from](https://blog.feathersjs.com/why-we-built-the-best-web-framework-you-ve-probably-never-heard-of-until-now-176afc5c6aac)
- [Learn about the high level design patterns behind Feathers](https://blog.feathersjs.com/design-patterns-for-modern-web-apis-1f046635215)
- [See how Feathers compares to others](https://feathersjs.com/comparison)

## Is Feathers production ready?

Yes! Feathers had its first stable release in 2014 and is being used in production by a bunch of companies from startups to fortune 500s. For some more details see [this answer on Quora](https://www.quora.com/Is-FeathersJS-production-ready).

## What Node versions does Feathers support

Feathers supports all NodeJS versions from the current Active LTS upwards. See [the Node.JS working group release schedule](https://github.com/nodejs/Release#release-schedule) for more information.

## How do I create custom methods?

Feathers is built around the [REST architectural constraints](https://en.wikipedia.org/wiki/Representational_state_transfer#Architectural_constraints) reflected by its standard service methods. There are many benefits using those methods like security, predictability and sending pre-defined real-time events so you should try to structure your application as services. For example:

- Send email action that does not store mail message in database.

Resources (services) don't have to be database records. It can be any kind of resource (like the current weather for a city or creating an email which will send it). Sending emails is usually done with either a separate email [service](../api/services.md):

```js
app.use('/email', {
  create(data) {
    return sendEmail(data);
  }
})
```

Or in a [hook](../api/hooks.md).

- Place an order in e-commerce web site. Behind the scenes, there are many records will be inserted in one transaction: order_item, order_header, voucher_tracking etc.

This is what [Feathers hooks](../api/hooks.md) are for. When creating a new order you also have a well defined hook chain:

```js
app.service('orders').hooks({
  before: {
    create: [
      validateData(),
      checkStock(),
      checkVoucher()
    ]
  },
  after: {
    create: [
      chargePayment(), // hook that calls `app.service('payment').create()`
      sendEmail(), // hook that calls `app.service('email').create()`
      updateStock() // Update product stock here
    ]
  }
})
```

However, there are some use cases where you might still want to allow additional methods for a client to call (like re-sending a verification email or resetting a password on the user service) and this is what [custom service method](../api/services.md#custom-methods) can be used for.

## How do I do nested or custom routes?

Normally we find that they actually aren't needed and that it is much better to keep your routes as flat as possible. For example something like `users/:userId/posts` is - although nice to read for humans - actually not as easy to parse and process as the equivalent `/posts?userId=<userid>` that is already [supported by Feathers out of the box](../api/databases/querying.md). Additionally, this will also work much better when using Feathers through websocket connections which do not have a concept of routes at all.

However, nested routes for services can still be created by registering an existing service on the nested route and mapping the route parameter to a query parameter like this:

```js
app.use('/posts', postService);
app.use('/users', userService);

// re-export the posts service on the /users/:userId/posts route
app.use('/users/:userId/posts', app.service('posts'));

// A hook that updates `data` with the route parameter
function mapUserIdToData(context) {
  if(context.data && context.params.route.userId) {
    context.data.userId = context.params.route.userId;
  }
}

// For the new route, map the `:userId` route parameter to the query in a hook
app.service('users/:userId/posts').hooks({
  before: {
    find(context) {
      context.params.query.userId = context.params.route.userId;
    },
    create: mapUserIdToData,
    update: mapUserIdToData,
    patch: mapUserIdToData
  }
})
```

Now going to `/users/123/posts` will call `postService.find({ query: { userId: 123 } })` and return all posts for that user.

For more information about URL routing and parameters, refer to [the Express chapter](../api/express.md).

> **Note:** URLs should never contain actions that change data (like `post/publish` or `post/delete`). This has always been an important part of the HTTP protocol and Feathers enforces this more strictly than most other frameworks. For example to publish a post you would call `.patch(id, { published: true })`.

## Why are you using JWT for sessions

Feathers is using [JSON web tokens (JWT)](https://jwt.io/) for its standard authentication mechanism. Some articles like [Stop using JWT for sessions](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/) promotes using standard cookies and HTTP sessions. While it brings up some valid points, not all of them apply to Feathers and there are other good reasons why Feathers relies on JWT:

- Feathers is designed to support many different transport mechanisms, most of which do not rely on HTTP but do work well with JWT as the authentication mechanism. This is even already the case for websockets where an established connection normally is not secured by a traditional HTTP session.
- By default the only thing that Feathers stored in the JWT payload is the user id. It is a stateful token. You can change this and make the token stateless by putting more data into the JWT payload but this is at your discretion. Currently the user is looked up on every request after the JWT is verified to not be expired or tampered with.
- You need to make sure that you revoke JWT tokens or set a low expiration date or add custom logic to verify that a user’s account is still valid/active. Currently the default expiration is 1 day. We chose a reasonable default for most apps but depending on your application this might be too long or too short.

Additionally, it is still possible to use Feathers with existing *traditional* Express session mechanism by using [custom Express middleware](../api/express.md). For example, `params.user` for all service calls from a traditional Express session can be passed like this:

```js
app.use(function(req,res, next) {
  // Set service call `param.user` from `session.user`
  req.feathers.user = req.session.user;
});
```

## Can you support another database?

Feathers [database adapters](../api/databases/adapters.md) implement 90% of the functionality you may need to use Feathers with certain databases and ORMs. However, even if your favourite database or ORM is not on the list or the adapter does not support specific functionality you are looking for, Feathers can still accomodate all your needs by [writing your own services](../api/services.md).

> __Important:__ To use Feathers properly it is very important to understand how services work and that all existing database adapters are just services that talk to the database themselves.

The why and how to write your own services is covered [in the Feathers guide](../guides/). In the generator a custom service can be created by running `feathers generate service`, choosing "A custom service" and then editing the `<servicename>/<servicename>.class.js` file to make the appropriate database calls.

If you would like to publish your own database adapter, first make sure there isn't already a [community maintained adapter](https://github.com/feathersjs/awesome-feathersjs#database) for that database (many maintainers are happy to get some help, too). If not, you can run `feathers generate plugin` to create a new plugin. A reference implementation for a database adapter can be found in the [feathers-memory repository](https://github.com/feathersjs-ecosystem/feathers-memory). It is always possible for community maintained adapters to graduate into an _official_ Feathers adapter, at the moment there are however no plans to add support for any new databases from the Feathers team directly.

## How do I watch for database changes?

In order to get real-time updates for a change, all requests have to go through your Feathers application or API server. Feathers does _not_ watch the database for changes so if changes in the database are made outside of the Feathers application and clients should be notified, the notification needs to be sent manually.

## I am not getting real-time events

Feathers v3 (`@feathersjs/feathers@v3.0.0`) introduced a more secure event system that does __not__ send real-time events by default. If you are not getting real-time events on the client, it is usually a problem with the [event channel](../api/channels.md) setup.

Have a look a the [quick start](../guides/basics/starting.md) and the [channels documentation](../api/channels.md).

The generated application already sets up a `channels.js` file that sends events to only authenticated users by default but can be modified to your needs according the the [channels documentation](../api/channels.md).

## How do I do search?

This depends on the database adapter you are using. See [the search querying chapter](../api/databases/querying.md#search) for more information.

## Why am I not getting JSON errors?

If you get a plain text error and a 500 status code for errors that should return different status codes, make sure you have the `express.errorHandler()` from the `@feathersjs/express` module configured as described in the [Express errors](../api/express.md#expresserrorhandler) chapter.

## Why am I not getting the correct HTTP error code

See the above answer.

## How can I do custom methods like `findOrCreate`?

Custom functionality can almost always be mapped to an existing service method using hooks.  For example, `findOrCreate` can be implemented as a before-hook on the service's `get` method.  [See this gist](https://gist.github.com/marshallswain/9fa3b1e855633af00998) for an example of how to implement this in a before-hook.

## How do I render templates?

Feathers works just like Express so it's the exact same. Here is [a cookbook recipe](../cookbook/express/view-engine.md).

## How do I create channels or rooms

In Feathers [channels](../api/channels.md) are the way to send [real-time events](../api/events.md) to only certain clients.

## How do I do validation?

If your database/ORM supports a model or schema (ie. Mongoose or Sequelize) then you have 2 options.

#### The preferred way

You perform validation at the service level [using hooks](../api/hooks.md). This is better because it keeps your app database agnostic so you can easily swap databases without having to change your validations much.

If you write a bunch of small hooks that validate specific things it is easier to test and also slightly more performant because you can exit out of the validation chain early instead of having to go all the way to the point of inserting data into the database to find out if that data is invalid.

If you don't have a model or schema then validating with hooks is currently your only option. If you come up with something different feel free to submit a PR!

#### The ORM way

With ORM adapters you can perform validation at the model level:

- [Using Mongoose](https://github.com/feathersjs-ecosystem/feathers-mongoose#validation)
- [Using Sequelize](http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations)

The nice thing about the model level validations is Feathers will return the validation errors to the client in a nice consistent format for you.

## How do I do associations?

Similar to validation, it depends on if your database/ORM supports models or not.

#### The preferred way

For any of the feathers database/ORM adapters you can just use [hooks](../api/hooks.md) to fetch data from other services.

This is a better approach because it keeps your application database agnostic and service oriented. By referencing the services (using `app.service().find()`, etc.) you can still decouple your app and have these services live on entirely separate machines or use entirely different databases without having to change any of your fetching code. We show how to associate data in a hook in the [Feathers guide](../guides/). An alternative are the [fastJoin](https://feathers-plus.github.io/v1/feathers-hooks-common/#fastjoin) or [populate](https://feathers-plus.github.io/v1/feathers-hooks-common/#populate) in [feathers-hooks-common](https://feathers-plus.github.io/v1/feathers-hooks-common/).

#### The ORM way

With mongoose you can use the `$populate` query param to populate nested documents.

```js
// Find Hulk Hogan and include all the messages he sent
app.service('user').find({
  query: {
    name: 'hulk@hogan.net',
    $populate: ['sentMessages']
  }
});
```

With Sequelize you can do this:

```js
// Find Hulk Hogan and include all the messages he sent
app.service('user').find({
  name: 'hulk@hogan.net',
  sequelize: {
    include: [{
      model: Message,
      where: { sender: Sequelize.col('user.id') }
    }]
  }
});
```

Or set it in a hook as [described here](https://github.com/feathersjs-ecosystem/feathers-sequelize#associations-and-relations).

## Sequelize models and associations

If you are using the [Sequelize](http://docs.sequelizejs.com/) adapter, understanding SQL and Sequelize first is very important. See the [associations section in the feathers-sequelize documentation](https://github.com/feathersjs-ecosystem/feathers-sequelize#associations) for more information on how to associate models using the Sequelize Feathers adapter.

## How do I access the request object in hooks or services?

In short, you shouldn't need to. If you look at the [hooks chapter](../api/hooks.md) you'll see all the params that are available on a hook.

If you still need something from the request object (for example, the requesting IP address) you can simply tack it on to the `req.feathers` object [as described here](../api/express.md#params) or `socket.feathers` when using web sockets as [described here](../api/socketio.md#appconfiguresocketiocallback).

## How do I mount sub apps?

It's pretty much exactly the same as Express. More information can be found [here](../api/express.md#sub-apps).

## How do I do some processing after sending the response to the user?

The hooks workflow allows you to handle these situations quite gracefully.  It depends if you `await` or not in your hook. Here's an example of a hook that sends an email, but doesn't wait for a success message.

```js
async context => {

  // Send an email by calling to the email service.
  context.app.service('emails').create({
    to: 'user@email.com',
    body: 'You are so great!'
  });

  // Send a message to some logging service.
  context.app.service('logging').create(context.data);

  return context;
}
```

## How do I debug my app

It's really no different than debugging any other NodeJS app but you can refer to [this blog post](https://blog.feathersjs.com/debugging-feathers-with-visual-studio-code-406e6adf2882) for more Feathers specific tips and tricks.

## `possible EventEmitter memory leak detected` warning

This warning is not as bad as it sounds. If you got it from Feathers you most likely registered more than 64 services and/or event listeners on a Socket. If you don't think there are that many services or event listeners you may have a memory leak. Otherwise you can increase the number in the [Socket.io configuration](../api/socketio.md) via `io.sockets.setMaxListeners(number)`. `number` can be `0` for unlimited listeners or any other number of how many listeners you'd expect in the worst case.

For example, if you need 555 listeners, you can do this in your `src/app.js` file by replacing `app.configure(socketio());` with `app.configure(socketio(function(io) {io.sockets.setMaxListeners(555);}));`.

## Why can't I pass `params` from the client?

When you make a call like:

```js
const params = { foo: 'bar' };
client.service('users').patch(1, { admin: true }, params).then(result => {
  // handle response
});
```

on the client the `context.params` object will only be available in your client side hooks. It will not be provided to the server. The reason for this is because `context.params` on the server usually contains information that should be server-side only. This can be database options, whether a request is authenticated, etc. If we passed those directly from the client to the server this would be a big security risk. Only the client side `context.params.query` and `context.params.headers` objects are provided to the server.

If you need to pass info from the client to the server that is not part of the query you need to add it to `context.params.query` on the client side and explicitly pull it out of `context.params.query` on the server side. This can be achieved like so:

```js
// client side
client.hooks({
  before: {
    all: [
      context => {
        context.params.query.$client = {
          platform: 'ios',
          version: '1.0'
        };

        return context;
      }
    ]
  }
});

// server side, inside app.hooks.js
const hooks = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [
      // remove values from context.params.query.$client and move them to context.params
      // so context.params.query.$client.version -> context.params.version
      // and context.params.query.$client is removed.
      hooks.client('version', 'platform')
    ]
  }
}
```

## My queries with null values aren't working

When making a request using REST (HTTP) query _string_ values don't have any type information and will always be strings. Some database adapters that have a schema (like `feathers-mongoose` or `feathers-sequelize`) will try to convert values to the correct type but others (like `feathers-mongodb`) can't. Additionally, `null` will always be a string and always has to be converted if you want to query for `null`. This can be done in a `before` [hook](../api/hooks.md):

```js
app.service('myservice').hooks({
  before: {
    find(context) {
      const { params: { query = {} } } = context;

      if(query.phone === 'null') {
        query.phone = null;
      }

      context.params.query = query;

      return context;
    }
  }
});
```

Also see [this issue](https://github.com/feathersjs/feathers/issues/894).

> __Note:__ This issue does not happen when using websockets since it retains all type information.

## Why are queries with arrays failing?

If you are using REST and queries with larger arrays (more than 21 items to be exact) are failing, you are probably running into an issue with the [querystring](https://github.com/ljharb/qs) module which [limits the size of arrays to 21 items](https://github.com/ljharb/qs#parsing-arrays) by default. The recommended solution is to implement a custom query string parser function via `app.set('query parser', parserFunction)` with the `arrayLimit` option set to a higher value:

```js
var qs = require('qs');

app.set('query parser', function (str) {
  return qs.parse(str, {
    arrayLimit: 100
  });
});
```

For more information see the [Express application settings](http://expressjs.com/en/4x/api.html#app.set) [@feathersjs/rest#88](https://github.com/feathersjs/feathers-rest/issues/88) and [feathers-mongoose#205](https://github.com/feathersjs-ecosystem/feathers-mongoose/issues/205).

## I always get a 404 for my custom middleware

Just like in Express itself, the order of middleware matters. If you registered a custom middleware outside of the generator, you have to make sure that it runs before the `notFound()` error midlleware.

## My configuration isn't loaded

If you are running or requiring the Feathers app from a different folder [Feathers configuration](../api/configuration.md) needs to be instructed where the configuration files for the app are located. Since it uses [node-config](https://github.com/lorenwest/node-config) this can be done by setting the [NODE_CONFIG_DIR envorinment variable](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config_dir).

## How do I set up HTTPS?

In most production environments your Feathers application should be behind an NginX proxy that handles HTTPS. It is also possible to add SSL directly to your Feathers application which is described in the [Express HTTPS docs](../api/express.md#https).
