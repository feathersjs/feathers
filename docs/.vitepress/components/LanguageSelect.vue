<script setup lang="ts">
import { useGlobalLanguage } from '../theme/store'
import Select from './Select.vue'

const activeGlobalLanguage = useGlobalLanguage()

const handleGlobalLanguageUpdate = (val: string) => {
  activeGlobalLanguage.value = val
  document.body.setAttribute('data-language', val)
}
</script>

<template>
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
</template>
