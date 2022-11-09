<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Footer from '../../components/Footer.vue'
import { useGlobalLanguage, useGlobalDb } from './store'
import Select from '../components/Select.vue'

const { Layout } = DefaultTheme

const activeGlobalLanguage = useGlobalLanguage()
const activeGlobalDb = useGlobalDb()

const handleGlobalLanguageUpdate = (val: string) => {
  activeGlobalLanguage.value = val
  document.body.setAttribute('data-language', val)
}
const handleGlobalDbUpdate = (val: string) => {
  if (activeGlobalDb.value !== val) {
    activeGlobalDb.value = val
    document.body.setAttribute('data-db', val)
  }
}
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <Select
        id="GlobalLanguageSelect"
        :value="activeGlobalLanguage"
        label="Code Language"
        :options="[
          { value: 'ts', text: 'TypeScript' },
          { value: 'js', text: 'JavaScript' }
        ]"
        @update-value="handleGlobalLanguageUpdate"
      />
      <Select
        id="GlobalDbSelect"
        :value="activeGlobalDb"
        label="Database"
        :options="[
          { value: 'sql', text: 'SQL' },
          { value: 'mongodb', text: 'MongoDB' }
        ]"
        @update-value="handleGlobalDbUpdate"
      />
    </template>
  </Layout>
  <Footer />
</template>
