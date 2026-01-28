<script setup lang="ts">
const colorMode = useCookie<'light' | 'dark'>('color-mode', {
  default: () => 'light'
})

function toggleTheme() {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button ghost circle aria-label="Toggle theme" @click="toggleTheme">
    <Icon v-if="colorMode === 'dark'" name="heroicons:sun" size="20" />
    <Icon v-else name="heroicons:moon" size="20" />
  </Button>
</template>
