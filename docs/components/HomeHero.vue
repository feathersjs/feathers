<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import CTAButton from './CTAButton.vue'
import { useData } from 'vitepress'

const { isDark } = useData()

const toggleHomeClass = () => document.getElementById('app')?.classList.toggle('home-page')

onMounted(toggleHomeClass)
onBeforeUnmount(toggleHomeClass)
</script>

<template>
  <div class="home-hero">
    <div class="illustration">
      <div class="feathers-home-hero relative">
        <div class="relative aspect-15/9 overflow-hidden">
          <img
            id="hero-day-bg"
            class="hero-bg-light w-screen transition-opacity duration-1000 pointer-events-none"
            src="/img/illustration/hero-day-bg.svg"
            alt="A sunny daytime background looking over FeathersJS Valley."
            width="1504"
            height="902"
          />
          <img
            id="hero-night-bg"
            class="hero-bg-dark w-screen absolute inset-0 transition-opacity duration-1000 pointer-events-none"
            src="/img/illustration/hero-night-bg.svg"
            alt="A chill nighttime background overlooking FeathersJS Valley"
            width="1504"
            height="902"
          />
          <img
            id="hero-day-sun-solo"
            class="hero-bg-dark w-screen absolute inset-0 transition-all duration-1000 pointer-events-none"
            src="/img/illustration/hero-day-sun-solo.svg"
            alt="The FeathersJS Birds enjoying a cool night in the valley of Feathers where a lovely treehouse sits next to the river running between the mountains."
            width="1583"
            height="1580"
          />
          <img
            id="hero-night-moon-solo"
            class="hero-bg-dark w-screen absolute inset-0 transition-all duration-1000 pointer-events-none"
            :class="[isDark ? '-top-[69%] opacity-100' : 'top-[300%] opacity-0']"
            src="/img/illustration/hero-night-moon-solo.svg"
            alt="The FeathersJS Birds enjoying a cool night in the valley of Feathers where a lovely treehouse sits next to the river running between the mountains."
            width="1583"
            height="1580"
          />
          <img
            id="hero-day-foreground"
            class="w-screen absolute inset-0 transition-opacity duration-1000 pointer-events-none"
            src="/img/illustration/hero-day-foreground.svg"
            alt="The FeathersJS Birds enjoying a cool night in the valley of Feathers where a lovely treehouse sits next to the river running between the mountains."
            width="1504"
            height="902"
          />
          <img
            class="hero-bg-dark w-screen absolute inset-0 transition-opacity duration-1000 pointer-events-none"
            src="/img/illustration/hero-night-foreground.svg"
            alt="The FeathersJS Birds enjoying a cool night in the valley of Feathers where a lovely treehouse sits next to the river running between the mountains."
            width="1504"
            height="902"
          />
          <div class="absolute inset-0 flex flex-col pt-13.5vw md:pt-14.5vw">
            <div
              class="transition-all duration-400 text-center text-lg xl:text-6xl leading-tight font-bold"
              sm="text-2xl"
              md="text-3xl"
              lg="text-5xl"
              xl="text-6xl"
            >
              The API and Real-time <br />
              Application Framework
            </div>
            <div class="mx-auto mt-4 lg:mt-12 hidden md:block">
              <CTAButton primary>Get Started</CTAButton>
            </div>
          </div>
        </div>
      </div>

      <div class="illustration-roundb text-center text-neutral-content pt-4 font-bold">
        <p class="text-xs md:text-base lg:text-lg xl:text-2xl">
          For TypeScript and JavaScript in Node.js, React Native and the browser
        </p>
        <div class="scale-80">
          <CTAButton href="/guides/basics/starting.html" primary class="mt-3 mb-6 md:mb-10"
            >Quick Start</CTAButton
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
@media (min-width: 768px) {
  .home-hero {
    margin-top: -56px;
    margin-bottom: 40px;
  }
}
@media (min-width: 960px) {
  .home-hero {
    margin-top: -144px;
    margin-bottom: 40px;
  }
}

#hero-day-sun-solo,
.dark #hero-night-moon-solo {
  @apply -top-[69%] opacity-100;
}
.dark #hero-day-sun-solo,
#hero-night-moon-solo {
  @apply top-[300%] opacity-0;
}

.hero-bg-dark {
  opacity: 0;
}
.dark .hero-bg-dark {
  opacity: 1;
}

.illustration {
  /* height: 69vw; */
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.illustration-roundb::before {
  background: var(--neutral);
  border-radius: 50%;
  bottom: 0;
  content: '';
  height: 300px;
  position: absolute;
  width: 150%;
  margin-left: -75%;
  z-index: -1;
}
</style>
