<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  primary: Boolean,
  href: String
})

const classes = computed(() => {
  return { 'btn-primary': props.primary }
})
</script>

<template>
  <a
    :href="href || '/guides/'"
    class="btn text-md font-bold uppercase px-6 py-0.5 rounded-full"
    md="text-lg px-8 py-1.6"
    lg="py-2.8 px-12"
    :class="classes"
  >
    <slot />
  </a>
</template>

<style lang="postcss">
.btn {
  animation: button-pop var(--animation-btn, 0.25s) ease-out;
}
.btn:active:hover,
.btn:active:focus {
  animation: none;
}
.btn:active:hover,
.btn:active:focus {
  transform: scale(var(--btn-focus-scale, 0.95));
}

.btn-primary {
  background-color: var(--vp-c-brand);
  transition: all 300ms;
}
.btn-primary:hover {
  background-color: var(--vp-c-brand-darker);
}

@keyframes button-pop {
  0% {
    transform: scale(var(--btn-focus-scale, 0.95));
  }
  40% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
