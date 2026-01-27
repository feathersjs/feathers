<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

export interface Tab {
  id: string
  icon: string
  title: string
}

const props = defineProps<{
  tabs: Tab[]
  snippets: Record<string, string>
  defaultTab?: string
}>()

const selectedTab = ref(props.defaultTab || props.tabs[0].id)

const parsedSnippet = ref<Awaited<ReturnType<typeof parseMarkdown>> | null>(null)
const copied = ref(false)

const rawCode = computed(() => {
  const snippet = props.snippets[selectedTab.value]
  // Remove the markdown code fence
  return snippet?.replace(/^```\w*\n/, '').replace(/\n```$/, '') || ''
})

async function copyToClipboard() {
  await navigator.clipboard.writeText(rawCode.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

async function updateSnippet() {
  const snippet = props.snippets[selectedTab.value]
  if (snippet) {
    parsedSnippet.value = await parseMarkdown(snippet, {
      highlight: {
        theme: 'github-dark'
      }
    })
  }
}

watch(selectedTab, updateSnippet, { immediate: true })
</script>

<template>
  <div data-theme="feathers-dark" class="bg-transparent">
    <MockupWindow class="relative w-full bg-base-300 rounded-b-none">
      <button class="btn btn-sm btn-ghost absolute top-2 right-2 z-10" @click="copyToClipboard">
        <Icon v-if="copied" name="carbon:checkmark" class="text-success" />
        <Icon v-else name="carbon:copy" />
      </button>
      <div class="py-4 px-6 lg:px-8 min-h-100 bg-base-300 overflow-x-auto">
        <MDCRenderer v-if="parsedSnippet?.body" :body="parsedSnippet.body" class="snippet-code" />
      </div>
    </MockupWindow>
    <Join class="w-full">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        class="btn join-item no-animation flex-1 h-20 flex-col rounded-t-none shadow-none!"
        :class="[
          selectedTab === tab.id ? 'bg-base-300 border-t-base-300' : 'bg-base-100',
          index === 0 ? 'rounded-bl-box' : '',
          index === tabs.length - 1 ? 'rounded-br-box' : ''
        ]"
        @click="selectedTab = tab.id"
      >
        <Icon :name="tab.icon" size="32" />
        <span class="text-xs">{{ tab.title }}</span>
      </button>
    </Join>
  </div>
</template>

<style scoped>
.snippet-code :deep(pre) {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  white-space: pre;
}

.snippet-code :deep(code) {
  font-size: 0.875rem;
  line-height: 1.7;
  white-space: pre;
  display: block;
}
</style>
