<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Footer from '../../components/Footer.vue'
import LanguageSelect from '../components/LanguageSelect.vue'
import DatabaseSelect from '../components/DatabaseSelect.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <LanguageSelect />
      <DatabaseSelect />
    </template>
  </Layout>
  <Footer />
</template>
