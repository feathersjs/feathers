<script setup lang="ts">
import HomeFeature1Content from "./HomeFeature1Content.vue"
</script>

<template>
  <div>
    <HomeFeature1Content class="block md:hidden" />
    <div class="flex flex-row">
      <div class="w-1/2 ml-6 flex items-end">
        <img src="/img/client-bird.svg" class="relative left-4 w-full" />
      </div>
      <div class="w-1/2 grid place-content-center">
        <HomeFeature1Content class="hidden md:block" />
      </div>
    </div>
  </div>
</template>
