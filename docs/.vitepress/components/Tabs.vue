<script setup lang="ts">
import { ref, watch, provide } from "vue"
import { useStorage } from "@vueuse/core"
import { useGlobalLanguage } from "../theme/store"

const props = defineProps({
  groupName: String,
  showTabs: Boolean,
})

// Tabs
const tabs = ref<any[]>([])
const addTab = (tabData: any) => {
  const existingIndex = tabs.value.findIndex((t) => t.name === tabData.name)
  return existingIndex !== -1 ? existingIndex : tabs.value.push(tabData) - 1
}

// Active Tab
const activeIndex: any = useStorage(props.groupName as string, 0)
const setActiveTab = (index: number) => {
  const tab = tabs.value[index]
  activeIndex.value = index
  // Update the globalId to sync tabs.
  // if (tab.globalId) activeGlobalId.value = tab.globalId
}

provide("tab-state", { addTab, activeIndex, showTabs: props.showTabs })

// Global ID
const activeGlobalId = useGlobalLanguage()
watch(activeGlobalId, (id) => {
  const matchingTabIndex = tabs.value.findIndex((t) => t.globalId === id)
  if (matchingTabIndex != -1) activeIndex.value = matchingTabIndex
})
</script>

<template>
  <div class="tabs mt-10 mb-8">
    <div v-if="showTabs" class="flex flex-row">
      <button
        type="button"
        v-for="(tab, index) in tabs"
        :key="tab.name"
        class="py-1.5 px-3"
        :class="{
          'active text-white bg-neutral': index === activeIndex,
          'bg-neutral/20': index !== activeIndex,
          'rounded-l-lg': index === 0,
          'rounded-r-lg': index === tabs.length - 1,
        }"
        @click="() => setActiveTab(index)"
      >
        {{ tab.name }}
      </button>
    </div>

    <slot />
  </div>
</template>
