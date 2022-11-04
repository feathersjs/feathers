<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Footer from '../../components/Footer.vue'
import { useGlobalLanguage, useGlobalDb } from './store'

import { watch, onMounted, getCurrentInstance, nextTick } from 'vue'
import Select from '../components/Select.vue'
import { prependDynamicComponent } from '../scripts/dynamic-component'
import { useRoute } from 'vitepress'

const { Layout } = DefaultTheme

const route = useRoute()
const instance = getCurrentInstance()
const activeGlobalLanguage = useGlobalLanguage()
const activeGlobalDb = useGlobalDb()

/**
 * Add the Global Language Select to the Left Nav. We watch for route changes to
 * make sure the select is put in place when navigating from and to the home page.
 */
onMounted(() => {
  const { app } = instance!.appContext
  watch(
    route,
    () => {
      // Use `nextTick` to wait until the sidebar has rendered
      nextTick(() => {
        const sidebar = document.querySelector('.VPSidebar')
        if (sidebar) {
          // Add the Database Adapter selector. Show only in the "Basics" guide
          prependDynamicComponent(
            app,
            Select,
            'GlobalDbSelect',
            {
              value: activeGlobalDb.value,
              label: 'Database',
              onUpdateValue: (val: string) => {
                if (activeGlobalDb.value !== val) {
                  activeGlobalDb.value = val
                  document.body.setAttribute('data-db', val)
                  // works around an SSR bug where the select resets to its SSR-hydrated state after a route change.
                  window.location = window.location
                }
              },
              showOnRoutePrefix: ['/guides/basics'],
              options: [
                { value: 'sql', text: 'SQL' },
                { value: 'mongodb', text: 'MongoDB' }
              ]
            },
            sidebar
          )
          // Always show the Language Select
          prependDynamicComponent(
            app,
            Select,
            'GlobalLanguageSelect',
            {
              value: activeGlobalLanguage.value,
              label: 'Code Language',
              onUpdateValue: (val: string) => {
                activeGlobalLanguage.value = val
                document.body.setAttribute('data-language', val)
              },
              options: [
                { value: 'ts', text: 'TypeScript' },
                { value: 'js', text: 'JavaScript' }
              ]
            },
            sidebar
          )
        }
      })
    },
    { immediate: true }
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
