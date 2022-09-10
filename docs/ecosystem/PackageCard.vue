<script setup lang="ts">
import { computed, ref, PropType } from 'vue'
import axios from 'axios'
import { nFormatter } from './helpers'
import { formatDistance } from 'date-fns'
import { PackageOutput } from './types'

defineProps({
  stats: {
    type: Object as PropType<PackageOutput>,
    required: true
  }
})
</script>

<template>
  <div class="feathers-package">
    <div class="flex">
      <a :title="stats.name" :href="stats.npmLink" target="_blank" rel="noopener noreferrer">
        {{ stats.name }}
      </a>
      <span class="text-gray-500 mx-2">|</span>
      <span>{{ stats.license }}</span>
      <span>
        <span class="text-gray-400">v</span>
        {{ stats.version }}
      </span>
    </div>
    <div class="flex my-1">
      <div class="flex mx-2">
        <div class="i-carbon-download" />
        {{ stats.downloads && nFormatter(stats.downloads) }}
      </div>
      <div class="flex mx-2">
        <div class="i-carbon-star-filled inline" />
        {{ nFormatter(stats.stars) }}
      </div>
      <div class="flex mx-2">
        <div class="i-carbon-time"></div>
        {{ formatDistance(stats.lastPublish, new Date()) }}
      </div>
    </div>
    <div class="text-xs text-gray-800 my-2">{{ stats.description }}</div>
    <div>
      <div
        v-for="keyword in stats.keywords"
        :key="keyword"
        class="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 mr-2 mb-1"
      >
        {{ keyword }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.feathers-package {
  margin-bottom: 30px;
}
</style>
