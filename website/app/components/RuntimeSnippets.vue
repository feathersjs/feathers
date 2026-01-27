<script setup lang="ts">
const tabs = [
  {
    id: 'nodejs',
    icon: 'logos:nodejs-icon',
    title: 'Node.js'
  },
  {
    id: 'deno',
    icon: 'logos:deno',
    title: 'Deno'
  },
  {
    id: 'bun',
    icon: 'logos:bun',
    title: 'Bun'
  },
  {
    id: 'cloudflare',
    icon: 'logos:cloudflare-workers-icon',
    title: 'Cloudflare'
  }
]

const snippets: Record<string, string> = {
  nodejs: `\`\`\`ts
import { createServer } from 'node:http'
import { feathers } from 'feathers'
import { createHandler, toNodeHandler } from 'feathers/http'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

server.listen(3030)
\`\`\``,
  deno: `\`\`\`ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

const handler = createHandler(app)

Deno.serve({ port: 3030 }, handler)
\`\`\``,
  bun: `\`\`\`ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

const handler = createHandler(app)

Bun.serve({
  port: 3030,
  fetch: handler
})
\`\`\``,
  cloudflare: `\`\`\`ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

const handler = createHandler(app)

export default {
  fetch: handler
}
\`\`\``
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <SectionHeader label="Run Anywhere" title="One Codebase, Any Runtime" />
    <CodeTabs :tabs="tabs" :snippets="snippets" default-tab="nodejs" />
  </div>
</template>
