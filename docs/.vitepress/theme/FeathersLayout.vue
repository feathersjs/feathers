<!--.vitepress/theme/MyLayout.vue-->
<script setup lang="ts">
import DefaultTheme from "vitepress/theme"
import Footer from "../../components/Footer.vue"
import "./store"

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      <!-- <div>My custom sidebar top content</div> -->
    </template>
    <template #aside-outline-after>
      <!-- <div>My custom sidebar top content</div> -->
    </template>
  </Layout>
  <Footer />
</template>
