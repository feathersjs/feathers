<script setup lang="ts">
definePageMeta({
  layout: 'page',
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="hero min-h-[70vh] bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-3xl">
          <h1 class="text-5xl font-bold mb-8">
            The API and Real-time Application Framework
          </h1>
          <p class="text-xl mb-8 text-base-content/80">
            Build prototypes in minutes and production-ready apps in days.
            Feathers is a lightweight web-framework for creating APIs and real-time applications
            with TypeScript or JavaScript.
          </p>
          <div class="flex gap-4 justify-center">
            <NuxtLink to="/docs" class="btn btn-primary btn-lg">
              Get Started
            </NuxtLink>
            <NuxtLink to="/docs/api" class="btn btn-outline btn-lg">
              API Docs
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-3xl font-bold text-center mb-12">Why Feathers?</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">Real-time by Default</h3>
              <p>
                Every Feathers service is real-time enabled out of the box.
                Use REST, WebSockets, or both at the same time.
              </p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">Universal</h3>
              <p>
                Works with any backend, supports multiple databases,
                and runs on Node.js, Deno, Bun, and in the browser.
              </p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">TypeScript First</h3>
              <p>
                Full TypeScript support with type-safe services, hooks,
                and schema validation using your favorite validation library.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
