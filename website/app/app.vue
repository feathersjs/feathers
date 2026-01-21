<script setup lang="ts">
const { isSearchOpen, openSearch } = useGlobalSearch()

// Global keyboard shortcut for search (Cmd+K / Ctrl+K)
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      openSearch()
    }
  }
  document.addEventListener('keydown', handleKeydown)
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})

const siteUrl = 'https://feathersjs.com'
const siteName = 'FeathersJS'
const defaultTitle = 'FeathersJS - The API and Real-time Application Framework'
const defaultDescription =
  'A framework for real-time applications and REST APIs. Build prototypes in minutes and production-ready apps in days.'
const defaultImage = `${siteUrl}/img/feathers-logo.png`

useHead({
  title: defaultTitle,
  htmlAttrs: {
    lang: 'en',
    'data-theme': 'feathers',
  },
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
  ],
})

useSeoMeta({
  title: defaultTitle,
  description: defaultDescription,
  ogTitle: defaultTitle,
  ogDescription: defaultDescription,
  ogImage: defaultImage,
  ogUrl: siteUrl,
  ogType: 'website',
  ogSiteName: siteName,
  twitterCard: 'summary_large_image',
  twitterTitle: defaultTitle,
  twitterDescription: defaultDescription,
  twitterImage: defaultImage,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Global Search Modal -->
  <DocsSearchModal
    v-model="isSearchOpen"
    :collections="['docs']"
    search-label="Search Docs"
    :popular-paths="['/docs', '/docs/guides', '/docs/api']"
  />
</template>
