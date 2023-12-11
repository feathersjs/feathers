---
outline: deep
---

# REST Client

The following chapter describes the use of

- [@feathersjs/rest-client](#feathersjsrest-client) as a client side Feathers HTTP API integration
- [Direct connection](#http-api) with any other HTTP client

## rest-client

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/rest-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/rest-client/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/rest-client --save
```

`@feathersjs/rest-client` allows to connect to a service exposed through a REST HTTP transport (e.g. with [Koa](../koa.md#rest) or [Express](../express.md#rest)) using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), [Superagent](https://github.com/ladjs/superagent) or [Axios](https://github.com/mzabriskie/axios).

<BlockQuote type="info">

For directly using a Feathers REST API (via HTTP) without using Feathers on the client see the [HTTP API](#http-api) section.

</BlockQuote>

<BlockQuote type="tip">

REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a real-time transport like [Socket.io](./socketio.md).

</BlockQuote>

<BlockQuote type="warning">

A client application can only use **a single transport** (e.g. either REST or Socket.io). Using two transports in the same client application is not necessary.

</BlockQuote>

### rest([baseUrl])

REST client services can be initialized by loading `@feathersjs/rest-client` and initializing a client object with a base URL.

```ts
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'

const app = feathers()

// Connect to the same as the browser URL (only in the browser)
const restClient = rest()

// Connect to a different URL
const restClient = rest('http://feathers-api.com')

// Configure an AJAX library (see below) with that client
app.configure(restClient.fetch(window.fetch.bind(window)))

// Connect to the `http://feathers-api.com/messages` service
const messages = app.service('messages')
```

The base URL is relative from where services are registered. That means that

- A service at `http://api.feathersjs.com/api/v1/messages` with a base URL of `http://api.feathersjs.com` would be available as `app.service('api/v1/messages')`
- A base URL of `http://api.feathersjs.com/api/v1` would be `app.service('messages')`.

<BlockQuote type="warning" label="important">

In the browser `window.fetch` (which the same as the global `fetch`) has to be passed as `window.fetch.bind(window)` otherwise it will be called with an incorrect context, causing a JavaScript error: `Failed to execute 'fetch' on 'Window': Illegal invocation`.

</BlockQuote>

### params.headers

Request specific headers can be through `params.headers` in a service call:

```js
app.service('messages').create(
  {
    text: 'A message from a REST client'
  },
  {
    headers: { 'X-Requested-With': 'FeathersJS' }
  }
)
```

### params.connection

Allows to pass additional options specific to the AJAX library. `params.connection.headers` will be merged with `params.headers`:

```js
app.configure(restClient.axios(axios))

app.service('messages').get(1, {
  connection: {
    // Axios specific options here
  }
})
```

### app.rest

`app.rest` contains a reference to the `connection` object passed to `rest().<name>(connection)`.

### Request libraries

The Feathers REST client can be used with several HTTP request libraries.

#### Fetch

The [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is the recommended way to make client connections since it does not require a third party library on most platforms:

```js
// In Node
app.configure(restClient.fetch(fetch))

// In modern browsers
app.configure(restClient.fetch(window.fetch.bind(window)))
```

Where supported, an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) can be used to abort fetch requests:

```js
const controller = new AbortController()

app.configure(restClient.fetch(fetch))

app.service('messages').get(1, {
  connection: {
    signal: controller.signal
  }
})

controller.abort()
```

#### Superagent

[Superagent](http://visionmedia.github.io/superagent/) currently works with a default configuration:

```ts
import superagent from 'superagent'

app.configure(restClient.superagent(superagent))
```

#### Axios

[Axios](http://github.com/mzabriskie/axios) currently works with a default configuration:

```js
import axios from 'axios'

app.configure(restClient.axios(axios))
```

To use default values for all requests, `axios.create` with [the axios configuration](https://axios-http.com/docs/req_config) can be used:

```js
import axios from 'axios'

app.configure(
  restClient.axios(
    axios.create({
      headers: { 'X-Requested-With': 'My-Feathers-Frontend' }
    })
  )
)
```

### Custom Methods

On the client, [custom service methods](../services.md#custom-methods) registered using the `methods` option when registering the service via `restClient.service()`:

```ts
import { feathers } from '@feathersjs/feathers'
import type { Params } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import type { RestService } from '@feathersjs/rest-client'

// `data` and return type of custom method
type CustomMethodData = { name: string }
type CustomMethodResponse = { acknowledged: boolean }

type ServiceTypes = {
  // The type is a RestService extended with custom methods
  myservice: RestService & {
    myCustomMethod(data: CustomMethodData, params: Params): Promise<CustomMethodResponse>
  }
}

const client = feathers<ServiceTypes>()

// Connect to the same as the browser URL (only in the browser)
const restClient = rest().fetch(window.fetch.bind(window))

// Connect to a different URL
const restClient = rest('http://feathers-api.com').fetch(window.fetch.bind(window))

// Configure an AJAX library (see below) with that client
client.configure(restClient)

// Register a REST client service with all methods listed
client.use('myservice', restClient.service('myservice'), {
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'myCustomMethod']
})

// Then it can be used like other service methods
client.service('myservice').myCustomMethod(data, params)
```

<BlockQuote type="info">

Just like on the server _all_ methods you want to use have to be listed in the `methods` option.

</BlockQuote>

### Connecting to multiple servers

It is possible to instantiate and use individual services pointing to different servers by calling `rest('server').<library>().service(name)`:

```ts
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'

const app = feathers()

const client1 = rest('http://feathers-api.com').fetch(window.fetch.bind(window))
const client2 = rest('http://other-feathers-api.com').fetch(window.fetch.bind(window))

// With additional options to e.g. set authentication information
const client2 = rest('http://other-feathers-api.com').fetch(window.fetch.bind(window), {
  headers: {
    Authorization: 'Bearer <Token for other-feathers-api.com>'
  }
})

// Configuring this will initialize default services for http://feathers-api.com
app.configure(client1)

// Connect to the `http://feathers-api.com/messages` service
const messages = app.service('messages')

// Register /users service that points to http://other-feathers-api.com/users
app.use('users', client2.service('users'))

const users = app.service('users')
```

<BlockQuote type="info" label="note">

If the authentication information is different, it needs to be set as an option as shown above or via `params.headers` when making the request.

</BlockQuote>

### Extending rest clients

This can be useful if you e.g. wish to override how the query is transformed before it is sent to the API.

```ts
import type { Query } from '@feathersjs/feathers'
import { FetchClient } from '@feathersjs/rest-client'
import qs from 'qs'

class CustomFetch extends FetchClient {
  getQuery(query: Query) {
    if (Object.keys(query).length !== 0) {
      const queryString = qs.stringify(query, {
        strictNullHandling: true
      })

      return `?${queryString}`
    }

    return ''
  }
}

app.configure(restClient.fetch(fetch, CustomFetch))
```

## HTTP API

You can communicate with a Feathers REST API using any other HTTP REST client. The following section describes what HTTP method, body and query parameters belong to which service method call.

All query parameters in a URL will be set as `params.query` on the server. Other service parameters can be set through [hooks](../hooks.md) and [Express middleware](../express.md). URL query parameter values will always be strings. Conversion (e.g. the string `'true'` to boolean `true`) on the server is done via [schemas](../schema/index.md) or [hooks](../hooks.md).

The body type for `POST`, `PUT` and `PATCH` requests is determined by the request type. You should also make sure you are setting your `Accept` header to `application/json`. Here is the mapping of service methods to REST API calls:

| Service method | HTTP method | Path        |
| -------------- | ----------- | ----------- |
| .find()        | GET         | /messages   |
| .get()         | GET         | /messages/1 |
| .create()      | POST        | /messages   |
| .update()      | PUT         | /messages/1 |
| .patch()       | PATCH       | /messages/1 |
| .remove()      | DELETE      | /messages/1 |

### Authentication

Authenticating HTTP (REST) requests is a two step process. First you have to obtain a JWT from the [authentication service](../authentication/service.md) by POSTing the strategy you want to use:

```json
// POST /authentication the Content-Type header set to application/json
{
  "strategy": "local",
  "email": "your email",
  "password": "your password"
}
```

Here is what that looks like with curl:

```bash
curl -H "Content-Type: application/json" -X POST -d '{"strategy":"local","email":"your email","password":"your password"}' http://localhost:3030/authentication
```

Then to authenticate subsequent requests, add the returned `accessToken` to the `Authorization` header as `Bearer <your access token>`:

```bash
curl -H "Content-Type: application/json" -H "Authorization: Bearer <your access token>" http://localhost:3030/messages
```

For more information see the [authentication API documentation](../).

### find

Retrieves a list of all matching resources from the service

```
GET /messages?status=read&user=10
```

Will call `messages.find({ query: { status: 'read', userId: '10' } })` on the server.

If you want to use any of the built-in find operands ($le, $lt, $ne, $eq, $in, etc.) the general format is as follows:

```
GET /messages?field[$operand]=value&field[$operand]=value2
```

For example, to find the records where field _status_ is not equal to **active** you could do

```
GET /messages?status[$ne]=active
```

The find API allows the use of $limit, $skip, $sort, and $select in the query. These special parameters can be passed directly inside the query object:

```
// Find all messages that are read, limit to 10, only include text field.
{"status": "read", "$limit":10, "$select": ["name"] } } // JSON

GET /messages?status=read&$limit=10&$select[]=text // HTTP
```

More information about the possible parameters for official database adapters can be found [in the database querying section](../databases/querying.md).

### get

Retrieve a single resource from the service.

```
GET /messages/1
```

Will call `messages.get(1, {})` on the server.

```
GET /messages/1?status=read
```

Will call `messages.get(1, { query: { status: 'read' } })` on the server.

### create

Create a new resource with `data` which may also be an array.

```
POST /messages
{ "text": "I really have to iron" }
```

Will call `messages.create({ "text": "I really have to iron" }, {})` on the server.

```
POST /messages
[
  { "text": "I really have to iron" },
  { "text": "Do laundry" }
]
```

<BlockQuote type="info" label="note">

With a [database adapters](../databases/adapters.md) the [`multi` option](../databases/common.md) has to be set explicitly to support creating multiple entries.

</BlockQuote>

### update

Completely replace a single or multiple resources.

```
PUT /messages/2
{ "text": "I really have to do laundry" }
```

Will call `messages.update(2, { text: 'I really have to do laundry' }, {})` on the server. When no `id` is given by sending the request directly to the endpoint something like:

```
PUT /messages?status=unread
{ "status": "read" }
```

Will call `messages.update(null, { status: 'read' }, { query: { status: 'unread' } })` on the server.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```
PATCH /messages/2
{ "status": "read" }
```

Will call `messages.patch(2, { status: 'read' }, {})` on the server. When no `id` is given by sending the request directly to the endpoint something like:

```
PATCH /messages?status=unread
{ "status": "read" }
```

Will call `messages.patch(null, { status: 'read' }, { query: { status: 'unread' } })` on the server to change the status for all read messages.

<BlockQuote type="info" label="note">

With a [database adapters](../databases/adapters.md) the [`multi` option](../databases/common.md) has to be set to support patching multiple entries.

</BlockQuote>

This is supported out of the box by the Feathers [database adapters](../databases/adapters.md)

### remove

Remove a single or multiple resources:

```
DELETE /messages/2
```

Will call `messages.remove(2, {} })`.

When no `id` is given by sending the request directly to the endpoint something like:

```
DELETE /messages?status=archived
```

Will call `messages.remove(null, { query: { status: 'archived' } })` to delete all read messages.

<BlockQuote type="info" label="note">

With a [database adapters](../databases/adapters.md) the [`multi` option](../databases/common.md) has to be set to support patching multiple entries.

</BlockQuote>

### Custom methods

[Custom service methods](../services.md#custom-methods) can be called directly via HTTP by sending a POST request and setting the `X-Service-Method` header to the method you want to call:

```
POST /messages

X-Service-Method: myCustomMethod

{
  "message": "Hello world"
}
```

Via CURL:

```bash
curl -H "Content-Type: application/json" -H "X-Service-Method: myCustomMethod" -X POST -d '{"message": "Hello world"}' http://localhost:3030/myservice
```

This will call `messages.myCustomMethod({ message: 'Hello world' }, {})`.

### Route placeholders

Service URLs can have placeholders, e.g. `users/:userId/messages`. (see in [express](../express.md#params.route) or [koa](../koa.md#params.route))

You can call the client with route placeholders in the `params.route` property:

```ts
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'

const app = feathers()

// Connect to the same as the browser URL (only in the browser)
const restClient = rest()

// Connect to a different URL
const restClient = rest('http://feathers-api.com')

// Configure an AJAX library (see below) with that client
app.configure(restClient.fetch(window.fetch.bind(window)))

// Connect to the `http://feathers-api.com/messages` service
const messages = app.service('users/:userId/messages')

// Call the `http://feathers-api.com/users/2/messages` URL
messages.find({
  route: {
    userId: 2
  }
})
```

This can also be achieved by using the client bundled,
sharing several `servicePath` variable exported in the [service shared file](../../guides/cli/service.shared.md#Variables) file.

```ts
import rest from '@feathersjs/rest-client'
// usersMessagesPath contains 'users/:userId/messages'
import { createClient, usersMessagesPath } from 'my-app'

const connection = rest('https://myapp.com').fetch(window.fetch.bind(window))

const client = createClient(connection)

// Call the `https://myapp.com/users/2/messages` URL
client.service(usersMessagesPath).find({
  route: {
    userId: 2
  }
})
```
