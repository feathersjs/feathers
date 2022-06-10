<script setup lang="ts">
import HomeFeature2Content from "./HomeFeature2Content.vue"
</script>

<template>
  <div class="pb-16">
    <div class="flex flex-row">
      <div class="w-1/2 grid place-content-center">
        <HomeFeature2Content class="hidden md:block" />
      </div>
      <div class="w-1/2 flex-none pl-12 pt-1 md:pt-3">
        <img
          src="/img/server-bird.svg"
          class="w-full md:pr-4 xl:pr-22 relative right-4"
        />
      </div>
    </div>
    <HomeFeature2Content class="block md:hidden" />
  </div>
</template>
