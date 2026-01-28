<script setup lang="ts">
import nodejsSnippet from '~/snippets/nodejs.ts?raw'
import denoSnippet from '~/snippets/deno.ts?raw'
import bunSnippet from '~/snippets/bun.ts?raw'
import cloudflareSnippet from '~/snippets/cloudflare.ts?raw'

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
  nodejs: '```ts\n' + nodejsSnippet + '\n```',
  deno: '```ts\n' + denoSnippet + '\n```',
  bun: '```ts\n' + bunSnippet + '\n```',
  cloudflare: '```ts\n' + cloudflareSnippet + '\n```'
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <SectionHeader label="Run Anywhere" title="One Codebase, Any Runtime" />
    <CodeTabs :tabs="tabs" :snippets="snippets" default-tab="nodejs" />
  </div>
</template>
