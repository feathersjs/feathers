<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  // Can be tip, info, warning, danger, or details
  type: { type: String, default: 'tip' },
  label: { type: String },
})
const outerTag = computed(() => (props.type === 'details' ? 'details' : 'div'))
const labelTag = computed(() => (props.type === 'details' ? 'summary' : 'p'))
</script>

<template>
  <component :is="outerTag" class="custom-block" :class="type">
    <component
      :is="labelTag"
      class="custom-block-title"
      :class="type === 'details' ? 'capitalize' : 'uppercase'"
    >
      {{ label || type }}
    </component>
    <slot />
  </component>
</template>
