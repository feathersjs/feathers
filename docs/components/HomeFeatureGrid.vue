<script setup lang="ts">
import HomeFeatureCard from './HomeFeatureGridCard.vue'

const cards = [
  {
    title: 'Fast',
    imgSrc: '/img/feature-icons/Fast_Icon.svg',
    description:
      'Leveraging a unique architecture, Feathers lets you focus on building your APIs and real-time applications quickly. You automatically get scalable HTTP and real-time APIs and stay prepared for whatever else the future might bring.'
  },
  {
    title: 'Universal',
    imgSrc: '/img/feature-icons/Universal_Icon.svg',
    description:
      'Feathers can be used with NodeJS, in the browser, with React Native or with any other API client. You can use any database with <a href="/api/databases/adapters.html">many supported out of the box</a> and connect your API seamlessly to any frontend framework.'
  },
  {
    title: 'Flexible',
    imgSrc: '/img/feature-icons/Flexible_Icon.svg',
    description:
      'Built for TypeScript, Feathers provides the structure to create complex applications but is flexible enough to not be in the way. With <a href="/ecosystem/">a large ecosystem of plugins</a> you can include exactly what you need. No more, no less.'
  }
]
</script>

<template>
  <div class="bg-secondary text-center pt-18 overflow-hidden">
    <h2 class="text-xl lg:text-2xl font-bold">See what makes Feathers special</h2>

    <div class="feature-grid flex md:flex-row flex-wrap justify-center relative mt-12">
      <HomeFeatureCard
        v-for="card in cards"
        class="w-72 m-6"
        :key="card.title"
        :title="card.title"
        :img-src="card.imgSrc"
        :description="card.description"
      />
    </div>

    <div class="bg-base-100 h-64 relative -mt-64"></div>
  </div>
</template>

<style lang="postcss">
/* Adds the white arc behind the cards */
.feature-grid::before {
  background-color: var(--vp-c-bg);
  border-radius: 50%;
  bottom: 0;
  content: '';
  height: 300px;
  position: absolute;
  width: 150%;
  z-index: 2;
}
</style>
