<script setup lang="ts">
import type { PropType } from 'vue'

interface TocLink {
  id: string
  text: string
  level: number
  children: TocLink[]
}

defineProps({
  links: {
    type: Array as PropType<TocLink[]>,
    required: true
  },
  checkActive: {
    type: Function as PropType<(id: string) => string | null>,
    required: true
  },
  scrollToHeading: {
    type: Function as PropType<(id: string) => void>,
    required: true
  },
  currentId: {
    type: String as PropType<string | null>,
    default: null
  }
})
</script>

<template>
  <Menu v-if="links && links.length" class="w-full">
    <MenuItem v-for="link in links" :key="link.id">
      <a
        class="block px-2 py-1 text-base-content rounded cursor-pointer"
        :class="{
          'hover:bg-accent/10': link.id !== currentId,
          'bg-base-300': checkActive(link.id) && link.id !== currentId,
          'menu-active': link.id === currentId
        }"
        @click.prevent="scrollToHeading(link.id)"
      >
        {{ link.text }}
      </a>
      <TocTree
        v-if="link.children && link.children.length"
        :links="link.children"
        :check-active="checkActive"
        :scroll-to-heading="scrollToHeading"
        :current-id="currentId"
      />
    </MenuItem>
  </Menu>
</template>
