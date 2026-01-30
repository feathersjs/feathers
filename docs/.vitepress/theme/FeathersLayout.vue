<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Footer from '../../components/Footer.vue'
import DatabaseSelect from '../components/DatabaseSelect.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-before>
      <div class="compatibility-warning">
        <strong>⚠️ Compatibility Documentation:</strong> You are viewing the documentation for the Feathers 6
        compatibility layer for v4 and v5. For the current documentation, please visit
        <a href="https://feathersjs.com" target="_blank" rel="noopener">feathersjs.com</a>.
      </div>
    </template>
    <template #sidebar-nav-before>
      <DatabaseSelect />
    </template>
  </Layout>
  <Footer />
</template>

<style scoped>
.compatibility-warning {
  background-color: var(--vp-c-warning-soft);
  border: 1px solid var(--vp-c-warning-1);
  border-radius: 8px;
  color: var(--vp-c-warning-1);
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 14px;
}

.compatibility-warning a {
  color: var(--vp-c-warning-1);
  font-weight: 600;
  text-decoration: underline;
}

.compatibility-warning a:hover {
  opacity: 0.8;
}
</style>
