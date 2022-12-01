<script setup lang="ts">
defineProps({
  title: String,
  imgSrc: String,
  description: String
})
</script>

<template>
  <div class="home-feature-card bg-base-100 bg-white shadow-xl p-8 space-y-4 z-10">
    <div class="flex items-center justify-center">
      <img :src="imgSrc" alt="" class="mx-auto w-42 h-42" />
    </div>
    <p class="font-bold text-xl">{{ title }}</p>
    <p class="vp-doc" v-html="description"></p>
  </div>
</template>
