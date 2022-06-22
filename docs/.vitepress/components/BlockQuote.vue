<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'tip' },
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
      {{ type === 'warning' ? 'important' : type}}
    </component>
    <slot />
  </component>
</template>
