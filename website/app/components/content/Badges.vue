<script setup lang="ts">
defineProps<{
  npm?: string
  changelog?: string
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2 my-4 not-prose">
    <a v-if="npm" :href="`https://www.npmjs.com/package/${npm}`" target="_blank" rel="noopener">
      <img :src="`https://img.shields.io/npm/v/${npm}.svg?style=flat-square`" :alt="`${npm} npm version`" />
    </a>
    <a v-if="changelog" :href="changelog" target="_blank" rel="noopener">
      <img src="https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square" alt="Changelog" />
    </a>
    <slot />
  </div>
</template>
