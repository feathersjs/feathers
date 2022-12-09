<script setup lang="ts">
import { useGlobalDb } from '../theme/store'
import Select from './Select.vue'

const activeGlobalDb = useGlobalDb()

const handleGlobalDbUpdate = (val: string) => {
  if (activeGlobalDb.value !== val) {
    activeGlobalDb.value = val
    document.body.setAttribute('data-db', val)
  }
}
</script>

<template>
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
