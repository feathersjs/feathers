<script setup lang="ts">
import { PropType } from 'vue'
import { nFormatter } from './helpers'
import { formatDistance as _formatDistance } from 'date-fns'
import { PackageOutput } from './types'
const intlFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
const props = defineProps({
  stats: {
    type: Object as PropType<PackageOutput>,
    required: true
  },
  isOld: {
    type: Boolean,
    default: false
  }
})
const formatDistance = (date: Date, baseDate: Date) => {
  try {
    return _formatDistance(date, new Date())
  } catch (err) {
    return ''
  }
}
const formatDate = (date: Date) => {
  try {
    return intlFormat.format(date)
  } catch (err) {
    return ''
  }
}
</script>

<template>
  <div class="feathers-package">
    <div class="flex items-center flex-col sm:flex-row mb-1">
      <a :href="`https://github.com/${stats.ownerName}`" target="_blank">
        <img v-if="stats.ownerAvatar" :src="stats.ownerAvatar" class="w-10 h-10 rounded-full mr-2" />
      </a>
      <div class="flex-1">
        <div class="flex justify-between flex-col sm:flex-row">
          <a
            :title="stats.hasNPM ? stats.name : stats.repository?.name"
            :href="stats.hasNPM ? stats.npmLink : stats.ghLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-lg flex flex-wrap justify-center md:justify-normal"
          >
            <template v-if="stats.name">{{ stats.name }}</template>
            <template v-else>{{ stats.repository?.name }}</template>
          </a>
          <div v-if="stats.hasNPM" class="flex justify-center md:justify-normal ml-2">
            <div>
              <span class="text-gray-500 font-extralight">v</span>
              <span class="font-semibold">{{ stats.version }}</span>
            </div>
          </div>
        </div>
        <div class="flex my-1 text-sm">
          <div
            v-if="stats.hasNPM"
            :title="`${stats.downloads} monthly npm downloads`"
            class="flex mx-2 items-center min-w-14"
          >
            <div class="i-carbon-download mr-1 w-3.5 h-3.5 text-gray-500" />
            <div class="flex-1 flex justify-center">{{ stats.downloads && nFormatter(stats.downloads) }}</div>
          </div>
          <div :title="`${stats.stars} stars on github`" class="flex mx-2 items-center min-w-14">
            <div class="i-carbon-star-filled mr-1 w-3.5 h-3.5 text-gray-500" />
            <div class="flex-1 flex justify-center">{{ nFormatter(stats.stars) }}</div>
          </div>
          <div
            v-if="stats.hasNPM"
            :title="`published on ${formatDate(stats.lastPublish)}`"
            class="flex mx-2 items-center min-w-16"
          >
            <div class="i-carbon-time mr-1 w-3.5 h-3.5 text-gray-500"></div>
            {{ formatDistance(stats.lastPublish, new Date()) }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex text-sm mb-2 justify-center sm:justify-start">
      <div v-if="stats.license" class="mx-2">{{ stats.license }}</div>
      <a
        v-if="stats.ghLink"
        :href="stats.ghLink"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center mx-2"
      >
        <div class="i-carbon-arrow-up-right mr-1 w-3.5 h-3.5" />
        Github
      </a>
      <a
        v-if="stats.hasNPM"
        :href="stats.npmLink"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center mx-2"
      >
        <div class="i-carbon-arrow-up-right mr-1 w-3.5 h-3.5" />
        npm
      </a>
    </div>
    <div class="text-gray-600 my-2 ml-2 text-sm md:text-base .dark:text-gray-300">
      <div v-if="isOld" class="border-l-4 border-red-500 bg-red-500/20 p-2 mb-2 text-sm">
        This package seems to be unmaintained. Please use with caution and consider taking over the
        maintenance! Please contact us if you want to over discord! ❤️
      </div>
      {{ stats.description }}
    </div>
    <div>
      <div
        v-for="keyword in stats.keywords"
        :key="keyword"
        class="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 mr-2 mb-1 .dark:bg-gray-700 .dark:text-gray-200"
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
