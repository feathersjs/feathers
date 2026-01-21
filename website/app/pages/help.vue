<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(
  () => route.path,
  () => queryCollection('help').path('/help').first()
)

definePageMeta({
  layout: 'docs'
})

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description
})
</script>

<template>
  <div>
    <Discord class="mb-8" />
    <DocsPage v-if="page" :page="page" />
  </div>
</template>
