<script setup lang="ts">
defineProps({
  title: String,
  items: Array,
})
</script>

<template>
  <ul class="text-lg">
    <li class="list-title font-bold text-2xl mb-4">{{ title }}</li>
    <li v-for="item in items" :key="item.title">
      <a :href="item.link">{{ item.label }}</a>
    </li>
  </ul>
</template>
