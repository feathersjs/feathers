

# Quick start

Let's learn Feathers! In this guide we'll build a message API from scratch using Node.js and its built-in SQLite database. You'll see how Feathers makes it easy to create a real-time API with just a few lines of code. If you want to jump right into creating a complete application you can also run `npm create feathers` to generate a new project.

<img style="margin: 2em;" src="/img/main-character-bench.svg" alt="Getting started">

Feathers works with all [currently active NodeJS releases](https://github.com/nodejs/Release#release-schedule). This guide uses features from the most current stable NodeJS release which you can get from the [NodeJS website](https://nodejs.org/en/).

After installation, the `node` and `npm` commands should be available on the terminal:

```
node --version
```

```
npm --version
```

::warning[Important]
Running NodeJS and npm should not require admin or root privileges.
::

Let's create a new folder for our application:

```sh
mkdir feathers-messages
cd feathers-messages
```

Since any Feathers application is a Node application, we can create a default [package.json](https://docs.npmjs.com/files/package.json) using `npm`:

```sh
npm init --yes
```

## Installing Feathers

Feathers can be installed like any other Node module by installing the [feathers](https://www.npmjs.com/package/feathers) package through [npm](https://www.npmjs.com). The same package can also be used with module loaders like Vite or Webpack and in React Native.

```sh
npm install feathers@pre --save
```

## Our first app

Now we can create a Feathers application with a simple `messages` service that allows us to create new messages and find all existing ones.

Create a file called `app.mjs` with the following content:

```js
import { feathers } from 'feathers'

// A messages service that allows us to create new
// and return all existing messages
class MessageService {
  messages = []

  async find() {
    return this.messages
  }

  async create(data) {
    const message = {
      id: this.messages.length,
      text: data.text
    }

    this.messages.push(message)

    return message
  }
}

const app = feathers()

// Register the message service on the Feathers application
app.use('messages', new MessageService())

// Log every time a new message has been created
app.service('messages').on('created', (message) => {
  console.log('A new message has been created', message)
})

// Create and list messages
const main = async () => {
  await app.service('messages').create({
    text: 'Hello Feathers'
  })

  await app.service('messages').create({
    text: 'Hello again'
  })

  const messages = await app.service('messages').find()

  console.log('All messages', messages)
}

main()
```

We can run it with

```sh
node app.mjs
```

We will see something like this in the terminal:

```sh
A new message has been created { id: 0, text: 'Hello Feathers' }
A new message has been created { id: 1, text: 'Hello again' }
All messages [ { id: 0, text: 'Hello Feathers' },
  { id: 1, text: 'Hello again' } ]
```

Here we implemented only `find` and `create`, but a service can also have other methods like `get`, `update`, `patch` and `remove`. We will learn more about service methods and events throughout this guide, but this sums up the most important concepts that Feathers is built on.

## An API Server

So far we've created a Feathers application and a message service. However, this is only a simple NodeJS script that prints some output and then exits. What we really want is to host it as an API server that other clients can talk to.

Feathers uses the Web Standard `Request`/`Response` API for HTTP handling. On Node.js, we use the `toNodeHandler` adapter to connect it to Node's built-in HTTP server.

Update `app.mjs` with the following content:

```js
import { createServer } from 'node:http'
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'
import { toNodeHandler } from 'feathers/http/node'

class MessageService {
  messages = []

  async find() {
    return this.messages
  }

  async create(data) {
    const message = {
      id: this.messages.length,
      text: data.text
    }

    this.messages.push(message)

    return message
  }
}

const app = feathers()

app.use('messages', new MessageService())

// Create the HTTP handler and server
const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

// Start the server on port 3030
server.listen(3030, () => {
  console.log('Feathers server listening on http://localhost:3030')
})

// Initialize all services
await app.setup(server)

// Create a message so the API has some data
app.service('messages').create({
  text: 'Hello world from the server'
})
```

We can start the server with

```sh
node app.mjs
```

::note
The server will stay running until you stop it by pressing **Control + C** in the terminal.
::

And in the browser visit

```
http://localhost:3030/messages
```

to see an array with the one message we created on the server. We can also create new messages by sending a POST request, for example using `curl` in another terminal:

```sh
curl -X POST http://localhost:3030/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "A new message"}'
```

Visiting `http://localhost:3030/messages` again will now show both messages.

This is the basic setup of a Feathers API server. The `createHandler` sets up everything needed to handle HTTP requests including error handling, query parsing and body parsing. When used as a REST API, incoming requests get mapped automatically to their corresponding service method:

| Service method                              | HTTP method | Path                  |
| ------------------------------------------- | ----------- | --------------------- |
| `service.find({ query: {} })`               | GET         | /messages             |
| `service.find({ query: { read: true } })`   | GET         | /messages?read=true   |
| `service.get(1)`                            | GET         | /messages/1           |
| `service.create(body)`                      | POST        | /messages             |
| `service.update(1, body)`                   | PUT         | /messages/1           |
| `service.patch(1, body)`                    | PATCH       | /messages/1           |
| `service.remove(1)`                         | DELETE      | /messages/1           |

## Using a database

Right now our messages are stored in memory and will be lost when the server restarts. Let's use Node's built-in [SQLite module](https://nodejs.org/api/sqlite.html) to persist our messages in a database.

::note
Node's built-in SQLite is available from Node.js v22.5.0 and later.
::

Update `app.mjs` with the following content:

```js
import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'
import { toNodeHandler } from 'feathers/http/node'
import { NotFound } from 'feathers/errors'

// Open (or create) a SQLite database file
const db = new DatabaseSync('messages.db')

// Create the messages table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL
  )
`)

class MessageService {
  async find(params) {
    const query = params?.query || {}
    let sql = 'SELECT * FROM messages'
    const conditions = []
    const values = []

    if (query.text) {
      conditions.push('text = ?')
      values.push(query.text)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY id DESC'

    if (query.$limit) {
      sql += ' LIMIT ?'
      values.push(Number(query.$limit))
    }

    const stmt = db.prepare(sql)
    return stmt.all(...values)
  }

  async get(id) {
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ?')
    const message = stmt.get(id)

    if (!message) {
      throw new NotFound(`Message ${id} not found`)
    }

    return message
  }

  async create(data) {
    const stmt = db.prepare('INSERT INTO messages (text) VALUES (?)')
    const result = stmt.run(data.text)

    return this.get(result.lastInsertRowid)
  }

  async patch(id, data) {
    const existing = await this.get(id)
    const stmt = db.prepare('UPDATE messages SET text = ? WHERE id = ?')

    stmt.run(data.text || existing.text, id)

    return this.get(id)
  }

  async remove(id) {
    const message = await this.get(id)
    const stmt = db.prepare('DELETE FROM messages WHERE id = ?')

    stmt.run(id)

    return message
  }
}

const app = feathers()

app.use('messages', new MessageService())

const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

server.listen(3030, () => {
  console.log('Feathers server listening on http://localhost:3030')
})

await app.setup(server)
```

Now restart the server with `node app.mjs` and try it out:

```sh
# Create a message
curl -X POST http://localhost:3030/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from SQLite"}'

# List all messages
curl http://localhost:3030/messages

# Get a single message
curl http://localhost:3030/messages/1

# Update a message
curl -X PATCH http://localhost:3030/messages/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Updated message"}'

# Delete a message
curl -X DELETE http://localhost:3030/messages/1
```

If you restart the server, your messages will still be there since they are now stored in the `messages.db` SQLite file.

## What's next?

In this chapter we created our first Feathers application and a message service, first with in-memory storage and then backed by SQLite. We hosted it as a REST API server where incoming HTTP requests get automatically mapped to service method calls.

In the [next chapter](./services) we will dive deeper into services and learn more about service methods, events and how data flows through a Feathers application.
