<script setup lang="ts">
interface Props {
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: Array<number>
  meta?: string | null
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  language: null,
  filename: null,
  highlights: () => [],
  meta: null,
  class: ''
})

const copied = ref(false)

const copyToClipboard = async () => {
  if (!props.code) return

  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}
</script>

<template>
  <div class="my-6">
    <div class="relative">
      <Badge v-if="filename" sm neutral class="absolute top-2.5 left-2 font-mono text-base-content/50">
        {{ filename }}
      </Badge>
      <Button v-if="code" xs neutral class="absolute top-2 right-4 cursor-pointer" @click="copyToClipboard">
        {{ copied ? 'Copied!' : 'Copy' }}
      </Button>
      <pre :class="['overflow-x-auto rounded-lg p-4', filename ? 'pt-12' : '', $props.class]"><slot /></pre>
    </div>
  </div>
</template>
