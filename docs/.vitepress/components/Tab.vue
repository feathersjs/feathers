<script setup lang="ts">
import { computed, inject } from 'vue'

const props = defineProps({
  name: String,
  globalId: String,
})

const { addTab, activeIndex, showTabs }: any = inject('tab-state')

const index = addTab({
  name: props.name,
  globalId: props.globalId,
})

const isActive = computed(() => {
  return index === activeIndex.value
})
</script>

<template>
  <div v-if="isActive" class="tab relative">
    <div
      v-if="!showTabs && !hideLabel"
      class="tab-label bg-neutral text-neutral-content inline-block text-xs px-2.5 py-1 rounded-t-md"
    >
      {{ name }}
    </div>
    <div class="z-0">
      <slot></slot>
    </div>
  </div>
</template>

<style>
.tab {
  @apply pt-6;
}
.tab-label {
  @apply absolute z-10 top-0;
}
.tab div[class*='language-']:first-child {
  @apply -mt-0.25;
}
</style>
