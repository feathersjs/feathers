<script setup lang="ts">
import { PropType } from 'vue'
import { nFormatter } from './helpers'
import { formatDistance } from 'date-fns'
import { PackageOutput } from './types'

const intlFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

defineProps({
  stats: {
    type: Object as PropType<PackageOutput>,
    required: true
  },
  isOld: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="feathers-package">
    <div class="flex items-center flex-col sm:flex-row">
      <a :href="`https://github.com/${stats.ownerName}`" target="_blank">
        <img v-if="stats.ownerAvatar" :src="stats.ownerAvatar" class="w-10 h-10 rounded-full mr-2" />
      </a>
      <div class="flex-1">
        <div class="flex justify-between flex-col sm:flex-row">
          <a
            :title="stats.name"
            :href="stats.npmLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-lg flex flex-wrap justify-center md:justify-normal"
          >
            <div>{{ stats.ownerName }}</div>
            /
            <div>{{ stats.name.substring(stats.ownerName.length + 1) }}</div>
          </a>
          <div class="flex justify-center md:justify-normal ml-2">
            <div>
              <span class="text-gray-500 font-extralight">v</span>
              <span class="font-semibold">{{ stats.version }}</span>
            </div>
          </div>
        </div>
        <div class="flex my-1 text-sm">
          <div :title="`${stats.downloads} weekly npm downloads`" class="flex mx-2 items-center min-w-14">
            <div class="i-carbon-download mr-1 w-3.5 h-3.5 text-gray-500" />
            <div class="flex-1 flex justify-center">{{ stats.downloads && nFormatter(stats.downloads) }}</div>
          </div>
          <div :title="`${stats.stars} stars on github`" class="flex mx-2 items-center min-w-14">
            <div class="i-carbon-star-filled mr-1 w-3.5 h-3.5 text-gray-500" />
            <div class="flex-1 flex justify-center">{{ nFormatter(stats.stars) }}</div>
          </div>
          <div
            :title="`published on ${intlFormat.format(stats.lastPublish)}`"
            class="flex mx-2 items-center min-w-16"
          >
            <div class="i-carbon-time mr-1 w-3.5 h-3.5 text-gray-500"></div>
            {{ formatDistance(stats.lastPublish, new Date()) }}
          </div>
        </div>
      </div>
    </div>
    <div class="text-gray-600 my-3 ml-2 text-sm md:text-base .dark:text-gray-300">
      <div v-if="isOld" class="border-l-4 border-red-500 bg-red-500/20 p-2 mb-2 text-sm">
        This package seems to be unmaintained. Please use with caution and consider taking over the
        maintenance! Please contact us if you want to over discord! ❤️
      </div>
      {{ stats.description }}
      <span>{{ stats.license }}</span>
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
