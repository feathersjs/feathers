<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="alert alert-success my-4">
    <Icon name="feather:check-circle" class="w-6 h-6 shrink-0" />
    <div>
      <div v-if="title" class="font-bold">{{ title }}</div>
      <div class="text-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
