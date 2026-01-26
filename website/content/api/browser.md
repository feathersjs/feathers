

# Browser

Feathers can run entirely in the browser, useful for offline-first applications, local-first data, and client-side service layers.

## Setup

```ts
import { feathers } from 'feathers'

const app = feathers()

app.use('messages', {
  messages: [],

  async find() {
    return this.messages
  },

  async get(id) {
    return this.messages.find(m => m.id === id)
  },

  async create(data) {
    const message = { id: this.messages.length, ...data }
    this.messages.push(message)
    return message
  },

  async remove(id) {
    const index = this.messages.findIndex(m => m.id === id)
    if (index !== -1) {
      const [removed] = this.messages.splice(index, 1)
      return removed
    }
    return null
  }
})

// Use services directly
const messages = await app.service('messages').create({ text: 'Hello' })
```

## With IndexedDB

For persistent browser storage, combine Feathers with IndexedDB:

```ts
import { feathers } from 'feathers'
import { openDB } from 'idb'

const db = await openDB('myapp', 1, {
  upgrade(db) {
    db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true })
  }
})

const app = feathers()

app.use('messages', {
  async find() {
    return db.getAll('messages')
  },

  async get(id) {
    return db.get('messages', id)
  },

  async create(data) {
    const id = await db.add('messages', data)
    return { id, ...data }
  },

  async patch(id, data) {
    const existing = await db.get('messages', id)
    const updated = { ...existing, ...data }
    await db.put('messages', updated)
    return updated
  },

  async remove(id) {
    const message = await db.get('messages', id)
    await db.delete('messages', id)
    return message
  }
})
```

## With Service Worker

Feathers can handle requests in a Service Worker for offline support:

```ts
// service-worker.ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Cached message' }]
  }
})

const handler = createHandler(app)

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Handle API requests with Feathers
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handler(event.request))
  }
})
```

## Events

Browser Feathers applications support the same event system as server applications:

```ts
const app = feathers()

app.use('messages', {
  messages: [],

  async create(data) {
    const message = { id: Date.now(), ...data }
    this.messages.push(message)
    return message
  }
})

// Listen for events
app.service('messages').on('created', (message) => {
  console.log('New message:', message)
  // Update UI
})

// Create a message - will trigger the event
await app.service('messages').create({ text: 'Hello' })
```
