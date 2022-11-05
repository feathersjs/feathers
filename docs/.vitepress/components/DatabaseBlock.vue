<script setup lang="ts">
import { useGlobalDb } from '../theme/store'

defineProps({
  globalId: String,
  inline: String
})

const activeGlobalDb = useGlobalDb()
</script>

<template>
  <component :is="inline ? 'span' : 'div'" :class="{ hidden: globalId !== activeGlobalDb }">
    <slot />
  </component>
</template>
