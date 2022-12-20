<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Footer from '../../components/Footer.vue'
import LanguageSelect from '../components/LanguageSelect.vue'
import DatabaseSelect from '../components/DatabaseSelect.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-before>
      <BlockQuote label="Pre-release" class="mb-8">
        This documentation is for the upcoming FeathersJS v5 (Dove) release.
        <a href="https://crow.docs.feathersjs.com/" target="_blank">Open v4 docs</a>
      </BlockQuote>
    </template>

    <template #sidebar-nav-before>
      <LanguageSelect />
      <DatabaseSelect />
    </template>
  </Layout>
  <Footer />
</template>
