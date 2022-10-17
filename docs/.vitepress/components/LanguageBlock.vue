<script setup lang="ts">
import { useGlobalLanguage } from '../theme/store'

defineProps({
  globalId: String,
  inline: String
})

const activeGlobalId = useGlobalLanguage()
</script>

<template>
  <component :is="inline ? 'span' : 'div'" :class="{ hidden: globalId !== activeGlobalId }">
    <slot />
  </component>
</template>
