<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Footer from '../../components/Footer.vue'
import './store'

import { watch, onMounted, getCurrentInstance, nextTick } from 'vue'
import LanguageSelect from '../components/LanguageSelect.vue'
import { prependDynamicComponent } from '../scripts/dynamic-component'
import { useRoute } from 'vitepress'

const { Layout } = DefaultTheme

const route = useRoute()
const instance = getCurrentInstance()

/**
 * Add the Global Language Select to the Left Nav. We watch for route changes to
 * make sure the select is put in place when navigating from and to the home page.
 */
onMounted(() => {
  const { app } = instance.appContext
  watch(
    route,
    () => {
      // Use `nextTick` to wait until the sidebar has rendered
      nextTick(() => {
        const sidebar = document.querySelector('.VPSidebar')
        if (sidebar)
          prependDynamicComponent(
            app,
            LanguageSelect,
            'GlobalLanguageSelect',
            {},
            sidebar,
          )
      })
    },
    { immediate: true },
  )
})
</script>

<template>
  <Layout>
    <template #aside-outline-before> </template>
    <template #aside-outline-after> </template>
  </Layout>
  <Footer />
</template>
