<script setup lang="ts">
const route = useRoute()

const pathWithoutHtml = computed(() => route.path.replace('.html', ''))
if (route.path.includes('.html')) {
  navigateTo(pathWithoutHtml.value, { redirectCode: 301 })
}

const { data: page } = await useAsyncData(
  () => pathWithoutHtml.value,
  () => queryCollection('help').path(route.path).first()
)

definePageMeta({
  layout: 'docs',
})

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description,
})
</script>

<template>
  <DocsPage v-if="page" :page="page" />
</template>
