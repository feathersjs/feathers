<script setup lang="ts">
import { computed, inject } from "vue"

const props = defineProps({
  name: String,
  globalId: String,
})

const { addTab, activeIndex, showTabs }: any = inject("tab-state")

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
      v-if="!showTabs"
      class="bg-neutral text-neutral-content inline-block text-xs px-2.5 py-1 rounded-t-md absolute -top-5 z-10"
    >
      {{ name }}
    </div>
    <slot></slot>
  </div>
</template>
