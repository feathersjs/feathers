<script setup lang="ts">
import type { Product } from '~~/content.config.schema'
import HeroProduct from '../components/HeroProduct.vue'

definePageMeta({
  layout: 'page'
})

const feathersProduct: Product = {
  title: 'Feathers JS',
  published: true,
  highlight: true,
  shortName: 'Feathers',
  description: 'The universal web framework',
  longDescription:
    'The only web framework with a universal interface. Realtime by default. Type-safe from server to client. Transport agnostic. Runs on every web runtime. Any database. Any frontend framework.',
  menuDescription: 'The API and real-time application framework',
  slug: 'feathers',
  icon: 'feathersdev:feathers',
  logo: '/img/logo-feathers-white.svg',
  link: '/guides/basics/starting',
  meta: {
    docLink: '/api',
    birdImage: '/img/eagle-space.svg',
    planetImage: '/img/planet-yellow.svg'
  }
}

const runtimes = [
  {
    icon: 'logos:nodejs-icon',
    title: 'Node.js',
    description: 'The original and most mature runtime. Full support for all Feathers features.'
  },
  {
    icon: 'logos:deno',
    title: 'Deno',
    description: 'Secure by default with built-in TypeScript support. No configuration needed.'
  },
  {
    icon: 'logos:bun',
    title: 'Bun',
    description: 'Blazing fast JavaScript runtime with native TypeScript and JSX support.'
  },
  {
    icon: 'logos:cloudflare-workers-icon',
    title: 'Cloudflare Workers',
    description: 'Deploy to the edge with serverless functions that run globally.'
  }
]

useSeoMeta({
  title: `${feathersProduct.shortName} - ${feathersProduct.description}`,
  description: feathersProduct.longDescription
})
</script>

<template>
  <div>
    <!-- Hero Section with colored background -->
    <div
      class="bg-[url('/img/top_background.svg')] bg-no-repeat bg-cover bg-center text-primary-content max-w-screen overflow-x-hidden"
    >
      <div class="relative mx-auto max-w-328 lg:drawer-open md:pt-16 px-4">
        <HeroProduct
          :product="feathersProduct"
          bird-classes="relative w-[200px] sm:w-[220px] lg:w-[350px] lg:top-24 transition-all duration-500 ease-in-out floating"
          planet-classes="absolute w-[318px] lg:w-[550px] transition-all duration-500 ease-in-out -bottom-[calc(100%-14rem)] -right-60 sm:-right-20 md:-right-40 lg:top-0 lg:-right-88 planet-wobble"
        />
      </div>
      <div class="h-64"></div>
    </div>

    <!-- Features Section -->
    <section class="bg-base-200 max-w-328 mx-auto -mt-64 rounded-4xl p-6 pt-12 lg:p-12">
      <h2 class="text-3xl font-bold text-center mb-12">Why Feathers?</h2>

      <Features />

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        <Hover3D v-for="runtime in runtimes" :key="runtime.title">
          <Card class="bg-base-100 shadow-xl h-full">
            <CardBody class="items-center text-center">
              <div class="text-5xl mb-4">
                <Icon :name="runtime.icon" />
              </div>
              <CardTitle>{{ runtime.title }}</CardTitle>
              <Text class="opacity-70" sm>{{ runtime.description }}</Text>
            </CardBody>
          </Card>
        </Hover3D>
      </div>
    </section>

    <!-- Feathers Explained Section -->
    <FeathersExplained />
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
