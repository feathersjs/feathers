<script setup lang="ts">
import { useGlobalLanguage } from "../theme/store"

defineProps({
  hideOnMobile: Boolean,
})

const activeGlobalId = useGlobalLanguage()

const options = [
  { value: "ts", text: "TypeScript" },
  { value: "js", text: "JavaScript" },
]
</script>

<template>
  <div :class="{ 'hidden lg:block': hideOnMobile }">
    <label>
      <span class="text-xs">Code Language</span>
      <div class="relative">
        <select
          v-model="activeGlobalId"
          class="language-select w-full border border-black/10 pl-3 py-1.5 bg-base-100 pr-10 font-semibold transition duration-200 ease-in-out rounded-md"
        >
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
        <div class="i-carbon-chevron-down absolute right-1.5 top-2.5" />
      </div>
    </label>
  </div>
</template>
