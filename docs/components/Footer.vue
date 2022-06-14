<script setup lang="ts">
import FooterList from './FooterList.vue'
import { useData } from 'vitepress'
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const { theme } = useData()

// Adjust width based on sidebar
const { width } = useWindowSize()
const addLeftMargin = computed(() => {
  return width.value > 960
})

const aboutList = [
  {
    label: 'Philosophy',
    link:
      'https://blog.feathersjs.com/why-we-built-the-best-web-framework-you-ve-probably-never-heard-of-until-now-176afc5c6aac',
  },
  { label: 'Comparison', link: '/comparison' },
  { label: 'Ecosystem', link: 'https://github.com/feathersjs/awesome-feathersjs' },
]
const learnList = [
  { label: 'Guides', link: '/guides/' },
  { label: 'API', link: '/api/' },
  { label: 'Blog', link: 'https://blog.feathersjs.com' },
]
const comparisonList = [
  { label: 'Feathers vs Firebase', link: '/feathers-vs-firebase' },
  { label: 'Feathers vs Meteor', link: '/feathers-vs-meteor' },
  { label: 'Feathers vs Sails', link: '/feathers-vs-sails' },
  { label: 'Feathers vs LoopBack', link: '/feathers-vs-loopback' },
]
const ecosystemList = [
  { label: 'Become a Backer', link: 'https://github.com/sponsors/daffl' },
  { label: 'Find Help', link: '/help/' },
  { label: 'Github Issues', link: 'https://github.com/feathersjs/feathers/issues' },
]
</script>

<template>
  <footer
    class="feathers-footer bg-neutral text-neutral-content"
    :class="{ 'sidebar-open': addLeftMargin }"
  >
    <div class="max-w-6xl w-full mx-auto pt-16 px-4">
      <div class="sidebar-adjust">
        <div class="title flex flex-row items-center ml-2">
          <img class="logo invert mr-2" src="/logo.svg" />
          feathers
        </div>

        <div class="flex flex-row flex-wrap mt-2">
          <FooterList title="About" :items="aboutList" class="m-6" />
          <FooterList title="Learn" :items="learnList" class="m-6" />
          <FooterList title="Comparison" :items="comparisonList" class="m-6" />
          <FooterList title="Ecosystem" :items="ecosystemList" class="m-6" />
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

<style>
/* Only indent the footer on pages other than home-page */
#app:not(.home-page) .feathers-footer.sidebar-open .sidebar-adjust {
  margin-left: 272px;
}
</style>
