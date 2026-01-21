<script setup lang="ts">
definePageMeta({
  layout: 'page'
})

const feathersProduct = {
  title: 'Feathers JS',
  published: true,
  highlight: true,
  shortName: 'Feathers',
  description: 'A full-stack web framework',
  longDescription:
    'Feathers is a full-stack web-framework for creating APIs and real-time applications with TypeScript or JavaScript. Feathers can interact with any backend technology, supports many databases out of the box and works with any frontend technology like React, VueJS, Angular, React Native, Android or iOS.',
  menuDescription: 'The API and real-time application framework',
  slug: 'feathers',
  icon: 'feathersdev:feathers',
  logo: '/img/logo-feathers-white.svg',
  link: '/docs/guides/basics/starting',
  meta: {
    docLink: '/docs/api',
    birdImage: '/img/bird-yellow.svg',
    planetImage: '/img/planet-yellow.svg'
  }
}

useSeoMeta({
  title: 'FeathersJS - The API and Real-time Application Framework',
  description:
    'Build prototypes in minutes and production-ready apps in days. Feathers is a lightweight web-framework for creating APIs and real-time applications with TypeScript or JavaScript.'
})
</script>

<template>
  <div>
    <!-- Hero Section with colored background -->
    <div
      class="bg-[url('/img/top_background.svg')] bg-no-repeat bg-cover bg-center text-primary-content max-w-screen overflow-x-hidden"
    >
      <div class="relative mx-auto max-w-[82rem] lg:drawer-open md:pt-16 px-4">
        <HeroProduct
          :product="feathersProduct"
          bird-classes="relative w-[250px] sm:w-[260px] lg:w-[412px] lg:top-24 transition-all duration-500 ease-in-out floating"
          planet-classes="absolute w-[318px] lg:w-[550px] transition-all duration-500 ease-in-out -bottom-[calc(100%-14rem)] -right-60 sm:-right-20 md:-right-40 lg:top-0 lg:-right-88 planet-wobble"
        />
      </div>
      <div class="h-64"></div>
    </div>

    <!-- Features Section -->
    <section class="bg-base-200 max-w-[82rem] mx-auto -mt-64 rounded-4xl p-6 pt-12 lg:p-12">
      <h2 class="text-3xl font-bold text-center mb-12">Why Feathers?</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Real-time by Default</h3>
            <p>
              Every Feathers service is real-time enabled out of the box. Use REST, WebSockets, or both at the
              same time.
            </p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Universal</h3>
            <p>
              Works with any backend, supports multiple databases, and runs on Node.js, Deno, Bun, and in the
              browser.
            </p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">TypeScript First</h3>
            <p>
              Full TypeScript support with type-safe services, hooks, and schema validation using your
              favorite validation library.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.floating {
  animation: float 6s ease-in-out infinite;
  will-change: transform;
}

@keyframes planet-wobble {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-32deg);
  }
}

.planet-wobble {
  animation: planet-wobble 60s infinite;
  will-change: transform;
  transform-origin: center;
}
</style>
