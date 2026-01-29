# REST Client

The following chapter describes the use of

- [@feathersjs/rest-client](#feathersjsrest-client) as a client side Feathers HTTP API integration
- [Direct connection](#http-api) with any other HTTP client

## rest-client

::badges{npm="@feathersjs/rest-client" changelog="https://github.com/feathersjs/feathers/blob/dove/packages/rest-client/CHANGELOG.md"}
::

```
npm install @feathersjs/rest-client --save
```

`@feathersjs/rest-client` allows to connect to a service exposed through a REST HTTP transport (e.g. with [Koa](../koa#rest) or [Express](../express#rest)) using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), [Superagent](https://github.com/ladjs/superagent) or [Axios](https://github.com/mzabriskie/axios).

::note
For directly using a Feathers REST API (via HTTP) without using Feathers on the client see the [HTTP API](#http-api) section.
::

::tip
REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a real-time transport like [Socket.io](./socketio).
::

::warning
A client application can only use **a single transport** (e.g. either REST or Socket.io). Using two transports in the same client application is not necessary.
::

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

::warning[important]
In the browser `window.fetch` (which the same as the global `fetch`) has to be passed as `window.fetch.bind(window)` otherwise it will be called with an incorrect context, causing a JavaScript error: `Failed to execute 'fetch' on 'Window': Illegal invocation`.
::

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

### FormData and File Uploads

The REST client automatically detects when you pass a `FormData` object and handles it appropriately - skipping JSON serialization and letting the browser set the correct `Content-Type` header with the multipart boundary.

```ts
// Create a FormData object
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('description', 'My uploaded file')

// Upload using the service - FormData is auto-detected
const result = await app.service('uploads').create(formData)
```

On the server, the data is parsed and converted to a plain object:

```ts
// Server receives:
{
  file: File,
  description: 'My uploaded file'
}
```

Multiple values for the same field name become an array:

```ts
// Client
const formData = new FormData()
formData.append('files', file1)
formData.append('files', file2)
formData.append('files', file3)

// Server receives:
{
  files: [File, File, File] // All files in one array
}
```

::warning[REST only]
FormData and file uploads are only supported with the REST/HTTP transport. Socket.io does not support FormData - attempting to send FormData over websockets will result in an error.
::

::note[note]
File uploads use the native `Request.formData()` API which buffers the entire request into memory. For large file uploads (videos, large datasets), consider using presigned URLs to upload directly to cloud storage (S3, R2, etc.).
::

### Streaming Uploads

The REST client supports streaming data to services using `ReadableStream`. This is useful for large file uploads, real-time data ingestion, or piping data directly to storage without buffering.

```ts
// Stream a file to a service
const file = fileInput.files[0]
const stream = file.stream()

const result = await app.service('uploads').create(stream, {
  headers: {
    'Content-Type': file.type,
    'X-Filename': file.name
  }
})
```

On the server, the service receives the `ReadableStream` directly:

```ts
class UploadService {
  async create(stream: ReadableStream, params: Params) {
    const filename = params.headers['x-filename']
    const contentType = params.headers['content-type']

    // Pipe directly to storage - no buffering
    await storage.upload(filename, stream, { contentType })

    return { filename, uploaded: true }
  }
}
```

The stream can be piped directly to cloud storage (S3, R2, etc.) without loading the entire file into memory:

```ts
async create(stream: ReadableStream, params: Params) {
  // Stream directly to R2/S3
  await env.MY_BUCKET.put(params.headers['x-filename'], stream)
  return { success: true }
}
```

For more complex metadata, you can stringify an object into a header:

```ts
// Client
const file = fileInput.files[0]

await app.service('csv-import').create(file.stream(), {
  headers: {
    'Content-Type': 'text/csv',
    'X-Import-Options': JSON.stringify({
      filename: file.name,
      tableName: 'products',
      skipHeader: true
    })
  }
})

// Server
async create(stream: ReadableStream, params: Params) {
  const options = JSON.parse(params.headers['x-import-options'])
  // options.filename, options.tableName, options.skipHeader
}
```

::warning[Header size limits]
HTTP headers are typically limited to 8KB total. Keep metadata small - use headers for filenames, options, and IDs, not large data payloads.
::

::note[Content-Type]
If no `Content-Type` header is specified, streaming requests default to `application/octet-stream`. Any content type not recognized as JSON, form-urlencoded, or multipart will be streamed through to the service.
::

::warning[REST only]
Streaming uploads are only supported with the REST/HTTP transport. Socket.io does not support streaming request bodies.
::

### Streaming Responses (SSE)

When a service returns an [async generator or async iterable](../http#async-iterators-sse), the server sends the response as Server-Sent Events (SSE). The REST client automatically detects this and returns an async iterable that you can consume with `for await...of`:

```ts
// Server - service returns an async generator
class ChatService {
  async *create(data: { prompt: string }) {
    const stream = await ai.generateStream(data.prompt)

    for await (const chunk of stream) {
      yield { type: 'text', content: chunk }
    }
  }
}

// Client - consume the stream
const response = app.service('chat').create({ prompt: 'Hello' })

for await (const chunk of response) {
  console.log(chunk.content) // Streams in real-time
}
```

This is useful for:

- **AI/LLM responses** - Stream tokens as they're generated
- **Progress updates** - Report status during long-running operations
- **Live data feeds** - Push data to clients as it becomes available

```ts
// Example: Streaming AI chat with status updates
class AIChatService {
  async *create(data: { messages: Message[] }, params: Params) {
    yield { type: 'status', text: 'Thinking...' }

    const stream = await llm.chat(data.messages)

    for await (const token of stream) {
      yield { type: 'text', text: token }
    }

    yield { type: 'done' }
  }
}

// Client
let fullResponse = ''

for await (const event of app.service('ai-chat').create({ messages })) {
  if (event.type === 'status') {
    showStatus(event.text)
  } else if (event.type === 'text') {
    fullResponse += event.text
    updateUI(fullResponse)
  }
}
```

::note[Automatic buffering]
The client automatically handles SSE stream buffering, correctly parsing events even when they arrive split across network chunks. This ensures reliable streaming regardless of network conditions.
::

::warning[REST only]
Streaming responses are only supported with the REST/HTTP transport. For real-time updates over Socket.io, use [channels and events](../channels) instead.
::

### Custom Methods

On the client, [custom service methods](../services#custom-methods) registered using the `methods` option when registering the service via `restClient.service()`:

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

::note
Just like on the server _all_ methods you want to use have to be listed in the `methods` option.
::

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

::note[note]
If the authentication information is different, it needs to be set as an option as shown above or via `params.headers` when making the request.
::

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

All query parameters in a URL will be set as `params.query` on the server. Other service parameters can be set through [hooks](../hooks) and [Express middleware](../express). URL query parameter values will always be strings. Conversion (e.g. the string `'true'` to boolean `true`) on the server is done via [schemas](../schema/index) or [hooks](../hooks).

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

Authenticating HTTP (REST) requests is a two step process. First you have to obtain a JWT from the [authentication service](../authentication/service) by POSTing the strategy you want to use:

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

More information about the possible parameters for official database adapters can be found [in the database querying section](../databases/querying).

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

::note[note]
With a [database adapters](../databases/adapters) the [`multi` option](../databases/common) has to be set explicitly to support creating multiple entries.
::

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

::note[note]
With a [database adapters](../databases/adapters) the [`multi` option](../databases/common) has to be set to support patching multiple entries.
::

This is supported out of the box by the Feathers [database adapters](../databases/adapters)

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

::note[note]
With a [database adapters](../databases/adapters) the [`multi` option](../databases/common) has to be set to support patching multiple entries.
::

### Custom methods

[Custom service methods](../services#custom-methods) can be called directly via HTTP by sending a POST request and setting the `X-Service-Method` header to the method you want to call:

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

Service URLs can have placeholders, e.g. `users/:userId/messages`. (see in [express](../express#params.route) or [koa](../koa#params.route))

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
sharing several `servicePath` variable exported in the [service shared file](../../guides/cli/service.shared#Variables) file.

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
