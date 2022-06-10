<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue"
import CTAButton from "./CTAButton.vue"

const toggleHomeClass = () =>
  document.getElementById("app")?.classList.toggle("home-page")

onMounted(toggleHomeClass)
onBeforeUnmount(toggleHomeClass)
</script>

<template>
  <div class="home-hero">
    <div class="illustration md:-top-16 lg:-top-20">
      <div class="feathers-home-hero relative">
        <img class="hero-bg-dark w-screen" src="/img/illustration/combined-night.svg" />
        <img
          class="hero-bg-light w-screen"
          src="/img/illustration/Final_Header_Illustration.jpg"
        />

        <div class="absolute inset-0 flex flex-col pt-13.5vw md:pt-14.5vw">
          <div
            class="text-center text-lg xl:text-6xl leading-tight font-bold"
            sm="text-2xl"
            md="text-3xl"
            lg="text-5xl"
            xl="text-6xl"
          >
            The Real-time Application <br />
            and API Framework
          </div>
          <div class="mx-auto mt-4 lg:mt-12">
            <CTAButton primary>Get Started</CTAButton>
          </div>
        </div>
      </div>

      <div class="illustration-roundb text-center text-neutral-content pt-4 font-bold">
        <p class="text-xs md:text-base lg:text-lg xl:text-2xl">
          For Node.js, Deno, and Cloudflare Workers
        </p>
        <div class="scale-80">
          <CTAButton primary class="mt-3 mb-6 md:mb-10">Get Started</CTAButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
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
  content: "";
  height: 300px;
  position: absolute;
  width: 150%;
  margin-left: -75%;
  z-index: -1;
}

/* Light Mode */
.hero-bg-light {
  display: initial;
}
.hero-bg-dark {
  display: none;
}

/* Dark mode */
.dark .hero-bg-light {
  display: none;
}
.dark .hero-bg-dark {
  display: initial;
}
</style>
