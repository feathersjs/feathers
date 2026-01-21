<script setup lang="ts">
const colorMode = useCookie<'light' | 'dark'>('color-mode', {
  default: () => 'light'
})

const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.value = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <Button ghost circle aria-label="Toggle theme" @click="toggleTheme">
    <Icon v-if="isDark" name="heroicons:moon" size="24" />
    <Icon v-else name="heroicons:sun" size="24" />
  </Button>
</template>
