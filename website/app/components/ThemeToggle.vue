<script setup lang="ts">
const colorMode = useCookie<'light' | 'dark'>('color-mode', {
  default: () => 'light',
  watch: true
})

const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.value = isDark.value ? 'light' : 'dark'
}

onMounted(() => {
  // Apply theme on mount
  document.documentElement.dataset.theme = isDark.value ? 'feathers-dark' : 'feathers-light'
})

watch(isDark, (dark) => {
  document.documentElement.dataset.theme = dark ? 'feathers-dark' : 'feathers-light'
})
</script>

<template>
  <Button ghost circle aria-label="Toggle theme" @click="toggleTheme">
    <Icon v-if="isDark" name="heroicons:moon" size="24" />
    <Icon v-else name="heroicons:sun" size="24" />
  </Button>
</template>
