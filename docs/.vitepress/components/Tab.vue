<script setup lang="ts">
import { computed, inject } from "vue"

const props = defineProps({
  name: String,
  globalId: String,
})

const { addTab, activeIndex }: any = inject("tab-state")

const index = addTab({
  name: props.name,
  globalId: props.globalId,
})

const isActive = computed(() => {
  return index === activeIndex.value
})
</script>

<template>
  <div v-if="isActive" class="tab"><slot></slot></div>
</template>
