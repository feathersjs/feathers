<script setup lang="ts">
import type { Product } from '~~/content.config.schema'

defineProps<{
  product: Product
  birdClasses: string
  planetClasses: string
}>()
</script>

<template>
  <div v-if="product" class="pb-32">
    <Flex
      col
      class="mx-auto max-w-6xl text-left lg:text-left gap-10 mt-28 sm:mt-32 relative md:px-4 lg:flex-row"
    >
      <Flex col items-center class="lg:items-start gap-8 lg:gap-12 flex-1">
        <Text size="lg" class="text-balance lg:text-3xl text-center md:text-left">{{
          product.description
        }}</Text>

        <div>
          <NuxtImg :src="product.logo" class="w-96" />
        </div>

        <Text is="div" lg center class="lg:text-left">
          {{ product.longDescription }}
        </Text>

        <Flex col class="sm:flex-row gap-4 w-full justify-center lg:justify-start">
          <Button
            is="NuxtLink"
            v-if="product.link"
            :to="product.link"
            lg
            class="bg-primary-content text-neutral hover:bg-primary-content/80"
          >
            Get Started
          </Button>
          <Button is="NuxtLink" v-if="product.meta.docLink" :to="product.meta.docLink" lg neutral>
            Documentation
          </Button>
        </Flex>
      </Flex>

      <Flex class="relative flex-1">
        <NuxtImg :src="product.meta.planetImage" :class="planetClasses" />
        <NuxtImg
          src="/img/rock-md.svg"
          class="absolute w-36 opacity-0 md:opacity-100 md:block top-50 left-72 lg:-top-1 lg:left-20 transition-all duration-500 ease-in-out floating-rock-1"
        />
        <NuxtImg
          src="/img/rock-lg.svg"
          class="absolute w-96.5 -bottom-24 -right-28 transition-all duration-500 ease-in-out floating-rock-2 hidden lg:block"
        />
        <NuxtImg :src="product.meta.birdImage" :class="birdClasses" />
      </Flex>
    </Flex>
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

@keyframes float-rock-1 {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(20px, -15px) rotate(24deg);
  }
  76% {
    transform: translate(-28px, 15px) rotate(54deg);
  }
}

@keyframes float-rock-2 {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  30% {
    transform: translate(-5px, -10px) rotate(-4deg);
  }
  70% {
    transform: translate(8px, 8px) rotate(4deg);
  }
}

.floating {
  animation: float 6s ease-in-out infinite;
  will-change: transform;
}

.floating-rock-1 {
  animation: float-rock-1 18s ease-in-out infinite;
  will-change: transform;
  transform-origin: center;
}

.floating-rock-2 {
  animation: float-rock-2 19s ease-in-out infinite;
  will-change: transform;
  transform-origin: center;
}

@keyframes float-shuttle {
  0%,
  100% {
    transform: translate(0, 0) rotate(-1deg) scale(1);
  }
  25% {
    transform: translate(-5px, -3px) rotate(0.5deg) scale(1.005);
  }
  50% {
    transform: translate(3px, 2px) rotate(-0.5deg) scale(0.995);
  }
  75% {
    transform: translate(-2px, 4px) rotate(0.3deg) scale(1.002);
  }
}

.floating-shuttle {
  animation: float-shuttle 20s ease-in-out infinite;
  will-change: transform;
  transform-origin: center;
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
