<script setup lang="ts">
const cards = [
  {
    title: 'Services',
    description:
      'Services are the heart of every Feathers application. They provide a uniform interface for any kind of data or API interaction.',
    image: '/img/explained/services.svg',
    link: '/api/services'
  },
  {
    title: 'Hooks',
    description:
      'Hooks are pluggable middleware functions that can be registered around, before, after or on errors of a service method without changing the original code.',
    image: '/img/explained/hooks.svg',
    link: '/api/hooks'
  },
  {
    title: 'Client',
    description:
      'The Feathers client works in the browser, React Native, and Node.js. Connect to your API over REST or WebSockets with full TypeScript support.',
    image: '/img/explained/client.svg',
    link: '/api/client'
  }
]
</script>

<template>
  <section class="max-w-328 mx-auto py-16 px-6 lg:px-12">
    <SectionHeader label="Learning and Resources" title="Feathers JS Explained" />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card v-for="card in cards" :key="card.title" class="bg-base-100">
        <figure class="bg-base-200 rounded-xl m-4 aspect-video flex items-center justify-center">
          <NuxtImg
            v-if="card.image"
            :src="card.image"
            :alt="card.title"
            class="w-full h-full object-cover rounded-xl"
          />
          <div v-else class="text-base-content/30 text-sm">Image placeholder</div>
        </figure>
        <CardBody>
          <CardTitle>{{ card.title }}</CardTitle>
          <Text class="opacity-70">{{ card.description }}</Text>
          <CardActions class="mt-4">
            <Button is="NuxtLink" :to="card.link" link class="p-0">
              Read more
              <Icon name="carbon:chevron-right" />
            </Button>
          </CardActions>
        </CardBody>
      </Card>
    </div>
  </section>
</template>
