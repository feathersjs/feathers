<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute } from 'vitepress'

interface Props {
  value: string
  label: string
  options: Array<{ value: string; text: string }>
  showOnRoutePrefix?: string[]
  hideOnMobile?: boolean
  hideLabel?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['updateValue'])

const route = useRoute()
const isVisible = ref(true)

const updateAttribute = (value: string) => {
  emit('updateValue', value)
}

const valueProxy = computed({
  get: () => props.value,
  set: (val: string) => {
    updateAttribute(val)
  }
})

onMounted(() => {
  updateAttribute(props.value)
  watch(
    () => route.path,
    (val) => {
      const prefixes = props.showOnRoutePrefix
      if (prefixes?.length) {
        const shouldShow = !!prefixes.find((p: string) => route.path.includes(p))
        isVisible.value = shouldShow
      }
    },
    { immediate: true }
  )
})
</script>

<template>
  <div
    class="transition-all duration-400 overflow-hidden"
    :class="{ 'hidden lg:block': hideOnMobile, 'max-h-20': isVisible, 'max-h-0': !isVisible }"
  >
    <label>
      <span v-if="!hideLabel" class="language-select-label text-sm font-bold block pt-2">{{ label }}</span>
      <div class="relative">
        <select
          v-model="valueProxy"
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

<style lang="postcss">
.language-select-label {
  color: var(--vp-c-text-1);
}
</style>
