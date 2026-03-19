# HTTP Client

The `fetchClient` from `feathers/client` connects to Feathers services through HTTP using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). See the [Feathers Client](../client) chapter for setup instructions.

## params.headers

Request specific headers can be set through `params.headers` in a service call:

```ts
app.service('messages').create(
  {
    text: 'A message from an HTTP client'
  },
  {
    headers: { 'X-Requested-With': 'FeathersJS' }
  }
)
```

## FormData and File Uploads

The HTTP client automatically detects when you pass a `FormData` object and handles it appropriately - skipping JSON serialization and letting the browser set the correct `Content-Type` header with the multipart boundary.

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

::warning[HTTP only]
FormData and file uploads are only supported with the HTTP transport.
::

::note[note]
File uploads use the native `Request.formData()` API which buffers the entire request into memory. For large file uploads (videos, large datasets), consider using presigned URLs to upload directly to cloud storage (S3, R2, etc.).
::

## Streaming Uploads

The HTTP client supports streaming data to services using `ReadableStream`. This is useful for large file uploads, real-time data ingestion, or piping data directly to storage without buffering.

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

::warning[HTTP only]
Streaming uploads are only supported with the HTTP transport.
::

## Streaming Responses (SSE)

When a service returns an [async generator or async iterable](../http#async-iterators-sse), the server sends the response as Server-Sent Events (SSE). The HTTP client automatically detects this and returns an async iterable that you can consume with `for await...of`:

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

::note
Streaming responses use the same SSE mechanism as [real-time events](./sse) but are scoped to a single request/response cycle. For push-based real-time updates across clients, use [channels and events](../channels) with [SSE](./sse).
::

## Route placeholders

Service URLs can have placeholders, e.g. `users/:userId/messages`. You can call the client with route placeholders in the `params.route` property:

```ts
import { feathers } from 'feathers'
import { fetchClient } from 'feathers/client'

const app = feathers()

app.configure(fetchClient(fetch, {
  baseUrl: 'http://api.my-feathers-server.com',
  sse: 'sse'
}))

await app.setup()

// Connect to the `http://api.my-feathers-server.com/messages` service
const messages = app.service('users/:userId/messages')

// Call the `http://api.my-feathers-server.com/users/2/messages` URL
messages.find({
  route: {
    userId: 2
  }
})
```

## HTTP API

You can communicate with a Feathers HTTP API using any other HTTP client. The following section describes what HTTP method, body and query parameters belong to which service method call.

All query parameters in a URL will be set as `params.query` on the server. Other service parameters can be set through [hooks](../hooks). URL query parameter values will always be strings. Conversion (e.g. the string `'true'` to boolean `true`) on the server is done via [schemas](../schema/index) or [hooks](../hooks).

The body type for `POST`, `PUT` and `PATCH` requests is determined by the request type. You should also make sure you are setting your `Accept` header to `application/json`. Here is the mapping of service methods to HTTP API calls:

| Service method | HTTP method | Path        |
| -------------- | ----------- | ----------- |
| .find()        | GET         | /messages   |
| .get()         | GET         | /messages/1 |
| .create()      | POST        | /messages   |
| .update()      | PUT         | /messages/1 |
| .patch()       | PATCH       | /messages/1 |
| .remove()      | DELETE      | /messages/1 |

### Authentication

To authenticate HTTP requests, add the access token to the `Authorization` header as `Bearer <your access token>`:

```bash
curl -H "Content-Type: application/json" -H "Authorization: Bearer <your access token>" http://localhost:3030/messages
```

For more information see the [authentication documentation](../authentication).

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

### remove

Remove a single or multiple resources:

```
DELETE /messages/2
```

Will call `messages.remove(2, {})`.

When no `id` is given by sending the request directly to the endpoint something like:

```
DELETE /messages?status=archived
```

Will call `messages.remove(null, { query: { status: 'archived' } })` to delete all archived messages.

::note[note]
With a [database adapters](../databases/adapters) the [`multi` option](../databases/common) has to be set to support removing multiple entries.
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
