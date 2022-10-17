<script setup lang="ts">
// A style wrapper to make npm badges do flex-row.
</script>

<template>
  <div class="badges"><slot /></div>
</template>

<style lang="postcss">
/* For npm and changelog badges */
.badges p {
  @apply flex flex-row;
}
.badges img {
  margin-right: .5em
}
</style>
