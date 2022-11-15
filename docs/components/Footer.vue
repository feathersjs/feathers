<script setup lang="ts">
import FooterList from './FooterList.vue'
import { useData, useRoute } from 'vitepress'
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const route = useRoute()
const { theme, frontmatter } = useData()

function ensureStartingSlash(path: any) {
  return /^\//.test(path) ? path : `/${path}`
}
function getSidebar(sidebar: any, path: any) {
  if (Array.isArray(sidebar)) {
    return sidebar
  }
  if (sidebar == null) {
    return []
  }
  path = ensureStartingSlash(path)
  const dir = Object.keys(sidebar)
    .sort((a, b) => {
      return b.split('/').length - a.split('/').length
    })
    .find((dir) => {
      // make sure the multi sidebar key starts with slash too
      return path.startsWith(ensureStartingSlash(dir))
    })
  return dir ? sidebar[dir] : []
}

const sidebar = computed(() => {
  const sidebarConfig = theme.value.sidebar
  const relativePath = route.data.relativePath
  return sidebarConfig ? getSidebar(sidebarConfig, relativePath) : []
})
const hasSidebar = computed(() => {
  return (
    frontmatter.value.sidebar !== false && sidebar.value.length > 0 && frontmatter.value.layout !== 'home'
  )
})

// Adjust width based on sidebar
const { width } = useWindowSize()
const addLeftMargin = computed(() => {
  return width.value > 960
})

const aboutList = [
  {
    label: 'Philosophy',
    link: 'https://blog.feathersjs.com/why-we-built-the-best-web-framework-you-ve-probably-never-heard-of-until-now-176afc5c6aac'
  },
  { label: 'Comparison', link: '/comparison' },
  { label: 'Ecosystem', link: 'https://github.com/feathersjs/awesome-feathersjs' }
]
const learnList = [
  { label: 'Guides', link: '/guides/' },
  { label: 'API', link: '/api/' },
  { label: 'Blog', link: 'https://blog.feathersjs.com' }
]
const ecosystemList = [
  { label: 'Become a Backer', link: 'https://github.com/sponsors/daffl' },
  { label: 'Find Help', link: '/help/' },
  { label: 'Github Issues', link: 'https://github.com/feathersjs/feathers/issues' }
]
</script>

<template>
  <footer
    class="VPContent has-sidebar feathers-footer bg-neutral text-neutral-content"
    :class="{
      'has-sidebar': hasSidebar,
      'is-home': frontmatter.layout === 'home'
    }"
  >
    <div class="max-w-6xl w-full mx-auto px-4">
      <div class="sidebar-adjust">
        <div class="title flex flex-row items-center ml-2">
          <img class="logo invert mr-2" src="/logo.svg" />
          feathers
        </div>

        <div class="flex flex-col sm:flex-row gap-12 sm:gap-0 flex-wrap mt-6 ml-10">
          <FooterList title="About" :items="aboutList" class="w-1/3" />
          <FooterList title="Learn" :items="learnList" class="w-1/3" />
          <FooterList title="Ecosystem" :items="ecosystemList" class="w-1/3" />
        </div>

        <div class="h-1 bg-primary rounded-full mt-16"></div>

        <div class="py-6 text-sm text-center">
          <p class="message">{{ theme.footer.message }}</p>
          <p class="copyright">{{ theme.footer.copyright }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
#app.home-page .feathers-footer {
  padding-top: 64px;
}

@media (min-width: 960px) {
  #app:not(.home-page) .VPContent {
    padding-top: var(--vp-nav-height);
  }

  #app:not(.home-page) .VPContent.has-sidebar {
    margin: var(--vp-layout-top-height, 0px) 0 0;
    padding-left: var(--vp-sidebar-width);
  }
}

@media (min-width: 1440px) {
  #app:not(.home-page) .VPContent.has-sidebar {
    padding-right: calc((100vw - var(--vp-layout-max-width)) / 2);
    padding-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
  }
}
</style>
