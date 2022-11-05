<script setup lang="ts">
import { useGlobalDb } from '../theme/store'

defineProps({
  globalId: String,
  inline: String
})

const activeGlobalId = useGlobalDb()
</script>

<template>
  <component :is="inline ? 'span' : 'div'" :class="{ hidden: globalId !== activeGlobalId }">
    <slot />
  </component>
</template>
