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
        You are looking at the website for the fully functional Feathers v5 (Dove) pre-release. Check out
        <a href="/guides/whats-new.html">what's new</a>, and please
        <a href="/help/">let us know about any issues or questions</a>
        . The current v4 documentation can be found at
        <a href="https://crow.docs.feathersjs.com/">https://crow.docs.feathersjs.com/</a>.
      </BlockQuote>
    </template>

    <template #sidebar-nav-before>
      <LanguageSelect />
      <DatabaseSelect />
    </template>
  </Layout>
  <Footer />
</template>
