# REST Client

## @feathersjs/rest-client

[![npm version](https://img.shields.io/npm/v/@feathersjs/client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/rest-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/rest-client/CHANGELOG.md)

```
npm install @feathersjs/rest-client --save
```

`@feathersjs/rest-client` allows to connect to a service exposed through the [Express REST HTTP API](../express.md#expressrest) using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), [Superagent](http://visionmedia.github.io/superagent/) or [Axios](https://github.com/mzabriskie/axios).

> **Note:** For directly using a Feathers REST API (via HTTP) without using Feathers on the client see the [HTTP API](#http-api) section.

<!-- -->

> **ProTip:** REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a real-time transport ([Socket.io](./socketio.md)).

<!-- -->

> **Note:** A client application can only use a single transport (e.g. either REST or Socket.io). Using two transports in the same client application is normally not necessary.

### rest([baseUrl])

REST client services can be initialized by loading `@feathersjs/rest-client` and initializing a client object with a base URL:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "Modular"
``` javascript
const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');

const app = feathers();

// Connect to the same as the browser URL (only in the browser)
const restClient = rest();

// Connect to a different URL
const restClient = rest('http://feathers-api.com')

// Configure an AJAX library (see below) with that client 
app.configure(restClient.fetch(window.fetch.bind(window)));

// Connect to the `http://feathers-api.com/messages` service
const messages = app.service('messages');
```
:::

::: tab "@feathersjs/client"
``` html
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script src="//unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js"></script>
<script>
  var app = feathers();
  // Connect to a different URL
  var restClient = feathers.rest('http://feathers-api.com')

  // Configure an AJAX library (see below) with that client 
  app.configure(restClient.fetch(window.fetch.bind(window)));

  // Connect to the `http://feathers-api.com/messages` service
  const messages = app.service('messages');
</script>
```
:::

::::

<!-- -->

> **ProTip:** When `window.fetch` (or just `fetch` which is normally equal to `window.fetch`) is passed to the FeathersJS REST client, its context (`this`) has to be bound to `window` (using `bind(window)` on it). Otherwise `window.fetch` would be called by the FeathersJS REST client with incorrect context, causing a JavaScript error: `Failed to execute 'fetch' on 'Window': Illegal invocation`.

> **ProTip:** In the browser, the base URL is relative from where services are registered. That means that a service at `http://api.feathersjs.com/api/v1/messages` with a base URL of `http://api.feathersjs.com` would be available as `app.service('api/v1/messages')`. With a base URL of `http://api.feathersjs.com/api/v1` it would be `app.service('messages')`.

### params.headers

Request specific headers can be through `params.headers` in a service call:

```js
app.service('messages').create({
  text: 'A message from a REST client'
}, {
  headers: { 'X-Requested-With': 'FeathersJS' }
});
```

### params.connection

Allows to pass additional options specific to the AJAX library. `params.connection.headers` will be merged with `params.headers`:

```js
app.configure(restClient.axios(axios));

app.service('messages').get(1, {
  connection: {
    // Axios specific options here
  }
});
```

With the `fetch` fork [yetch](https://github.com/Netflix/yetch) it can also be used to abort requests:

```js
const yetch = require('yetch');
const controller = new AbortController();

app.configure(restClient.fetch(yetch));

const promise = app.service('messages').get(1, {
  connection: {
    signal: controller.signal
  }
});

promise.abort();
```

### app.rest

`app.rest` contains a reference to the `connection` object passed to `rest().<name>(connection)`.

### Request libraries

The Feathers REST client can be used with several HTTP request libraries.

#### Fetch

Fetch uses a default configuration:

```js
// In Node
const fetch = require('node-fetch');

app.configure(restClient.fetch(fetch));

// In modern browsers
app.configure(restClient.fetch(window.fetch));
```

#### Superagent

[Superagent](http://visionmedia.github.io/superagent/) currently works with a default configuration:

```js
const superagent = require('superagent');

app.configure(restClient.superagent(superagent));
```

#### Axios

[Axios](http://github.com/mzabriskie/axios) currently works with a default configuration:

```js
const axios = require('axios');

app.configure(restClient.axios(axios));
```

To use default values for all requests, `axios.create` with [the axios configuration](https://axios-http.com/docs/req_config) can be used:

```js
const axios = require('axios');

app.configure(restClient.axios(axios.create({
  headers: {'X-Requested-With': 'My-Feathers-Frontend'}
})));
```


### Custom Methods

On the client, [custom service methods](../services.md#custom-methods) are also registered using the `methods` option when registering the service via `restClient.service()`:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');

const client = feathers();

// Connect to the same as the browser URL (only in the browser)
const restClient = rest();

// Connect to a different URL
const restClient = rest('http://feathers-api.com').fetch(window.fetch.bind(window))

// Configure an AJAX library (see below) with that client 
client.configure(restClient);

// Register a REST client service with all methods listed
client.service('myservice', restClient.service('myservice'), {
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'myCustomMethod']
});

// Then it can be used like other service methods
client.service('myservice').myCustomMethod(data, params);
```
:::

::: tab "TypeScript"
```typescript
import { feathers, CustomMethod } from '@feathersjs/feathers';
import rest, { RestService } from '@feathersjs/rest-client';

// `data` and return type of custom method
type CustomMethodData = { name: string }
type CustomMethodResponse = { acknowledged: boolean }

type ServiceTypes = {
  // The type is a Socket service extended with custom methods
  myservice: SocketService & {
    myCustomMethods: CustomMethod<CustomMethodData, CustomMethodResponse>
  }
}

const client = feathers<ServiceTypes>();

// Connect to the same as the browser URL (only in the browser)
const restClient = rest().fetch(window.fetch);

// Connect to a different URL
const restClient = rest('http://feathers-api.com').fetch(window.fetch);

// Configure an AJAX library (see below) with that client 
client.configure(restClient);

// Register a REST client service with all methods listed
client.service('myservice', restClient.service('myservice'), {
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'myCustomMethod']
});

// Then it can be used like other service methods
client.service('myservice').myCustomMethod(data, params);
```
:::

::::

> __Note:__ Just like on the server *all* methods you want to use have to be listed in the `methods` option.

### Connecting to multiple servers

It is possible to instantiate and use individual services pointing to different servers by calling `rest('server').<library>().service(name)`:

```js
const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');

const app = feathers();

const client1 = rest('http://feathers-api.com').fetch(window.fetch.bind(window));
const client2 = rest('http://other-feathers-api.com').fetch(window.fetch.bind(window));

// With additional options to e.g. set authentication information
const client2 = rest('http://other-feathers-api.com').fetch(window.fetch.bind(window),{
  headers: {
    Authorization: 'Bearer <Token for other-feathers-api.com>'
  }
});

// Configuring this will initialize default services for http://feathers-api.com
app.configure(client1);

// Connect to the `http://feathers-api.com/messages` service
const messages = app.service('messages');

// Register /users service that points to http://other-feathers-api.com/users
app.use('/users', client2.service('users'));

const users = app.service('users');
```

> __Note:__ If the authentication information is different, it needs to be set as an option as shown above or via `params.headers` when making the request.

### Extending rest clients

This can be useful if you wish to override how the query is transformed before it is sent to the API.

```js
// In Node
const fetch = require('node-fetch');
const { FetchClient } = require('@feathersjs/rest-client');
const qs = require('qs');

class CustomFetch extends FetchClient {
  getQuery (query) {
    if (Object.keys(query).length !== 0) {
      const queryString = qs.stringify(query, {
        strictNullHandling: true
      });

      return `?${queryString}`;
    }

    return '';
  }
}

app.configure(restClient.fetch(fetch, CustomFetch));
```

## HTTP API

You can communicate with a Feathers REST API using any other HTTP REST client. The following section describes what HTTP method, body and query parameters belong to which service method call.

All query parameters in a URL will be set as `params.query` on the server. Other service parameters can be set through [hooks](../hooks.md) and [Express middleware](../express.md). URL query parameter values will always be strings. Conversion (e.g. the string `'true'` to boolean `true`) can be done in a hook as well.

The body type for `POST`, `PUT` and `PATCH` requests is determined by the Express [body-parser](http://expressjs.com/en/4x/api.html#express.json) middleware which has to be registered *before* any service. You should also make sure you are setting your `Accept` header to `application/json`. Here is the mapping of service methods to REST API calls:

| Service method  | HTTP method | Path        |
|-----------------|-------------|-------------|
| .find()         | GET         | /messages   |
| .get()          | GET         | /messages/1 |
| .create()       | POST        | /messages   |
| .update()       | PUT         | /messages/1 |
| .patch()        | PATCH       | /messages/1 |
| .remove()       | DELETE      | /messages/1 |

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

For more information see the [authentication API documentation](../readme.md).

### find

Retrieves a list of all matching resources from the service

```
GET /messages?status=read&user=10
```

Will call `messages.find({ query: { status: 'read', user: '10' } })` on the server.

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
{"read":"1", "$limit":10, "$select": ["name"] } } // JSON

GET /messages?read=1&$limit=10&$select[]=text // HTTP
```

More information about the possible parameters for official database adapters can be found [in the database querying section](../databases/querying.md).

### get

Retrieve a single resource from the service.

```
GET /messages/1
```

Will call `messages.get(1, {})` on the server.

```
GET /messages/1?fetch=all
```

Will call `messages.get(1, { query: { fetch: 'all' } })` on the server.

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

> **Note:** With a [database adapters](../databases/adapters.md) the [`multi` option](../databases/common.md) has to be set explicitly to support creating multiple entries.

### update

Completely replace a single or multiple resources.

```
PUT /messages/2
{ "text": "I really have to do laundry" }
```

Will call `messages.update(2, { "text": "I really have to do laundry" }, {})` on the server. When no `id` is given by sending the request directly to the endpoint something like:

```
PUT /messages?complete=false
{ "complete": true }
```

Will call `messages.update(null, { "complete": true }, { query: { complete: 'false' } })` on the server.

> **ProTip:** `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```
PATCH /messages/2
{ "read": true }
```

Will call `messages.patch(2, { "read": true }, {})` on the server. When no `id` is given by sending the request directly to the endpoint something like:

```
PATCH /messages?complete=false
{ "complete": true }
```

Will call `messages.patch(null, { complete: true }, { query: { complete: 'false' } })` on the server to change the status for all read messages.

> **Note:** With a [database adapters](../databases/adapters.md) the [`multi` option](../databases/common.md) has to be set to support patching multiple entries.

This is supported out of the box by the Feathers [database adapters](../databases/adapters.md) 

### remove

Remove a single or multiple resources:

```
DELETE /messages/2?cascade=true
```

Will call `messages.remove(2, { query: { cascade: 'true' } })`.

When no `id` is given by sending the request directly to the endpoint something like:

```
DELETE /messages?read=true
```

Will call `messages.remove(null, { query: { read: 'true' } })` to delete all read messages.

> **Note:** With a [database adapters](../databases/adapters.md) the [`multi` option](../databases/common.md) has to be set to support patching multiple entries.


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
