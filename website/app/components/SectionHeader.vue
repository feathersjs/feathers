<script setup lang="ts">
defineProps<{
  label?: string
  title: string
}>()
</script>

<template>
  <div>
    <Text v-if="label" block center class="opacity-70 mb-2">{{ label }}</Text>
    <h2 class="text-3xl font-bold text-center mb-12">{{ title }}</h2>
  </div>
</template>
