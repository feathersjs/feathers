<script setup lang="ts">
import CTAButton from './CTAButton.vue'

defineProps({
  text: String,
})
</script>

<template>
  <div class="py-24 text-center">
    <h2 class="text-lg font-bold mb-10 md:text-2xl lg:text-3xl">{{ text }}</h2>
    <CTAButton primary>Get Started</CTAButton>
  </div>
</template>
