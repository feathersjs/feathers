<script setup lang="ts">
import FooterList from "./FooterList.vue"
import { useData } from "vitepress"
import { useWindowSize } from "@vueuse/core"
import { computed } from "vue"

const { theme } = useData()

// Adjust width based on sidebar
const { width } = useWindowSize()
const addLeftMargin = computed(() => {
  return width.value > 960
})

const list1 = [
  { label: "Philosophy", link: "/philosophy" },
  { label: "Comparison", link: "/comparison" },
  { label: "Ecosystem", link: "/ecosystem" },
]
const list2 = [
  { label: "Documentation", link: "/docs" },
  { label: "Guides", link: "/guides" },
  { label: "Blog", link: "/blog" },
]
const list3 = [
  { label: "Become a Backer", link: "/become-a-backer" },
  { label: "Find Help", link: "/help" },
  { label: "Github Issues", link: "https://github.com/feathersjs/feathers/issues" },
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
          <FooterList title="About" :items="list1" class="m-6" />
          <FooterList title="Comparison" :items="list2" class="m-6" />
          <FooterList title="Ecosystem" :items="list3" class="m-6" />
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
