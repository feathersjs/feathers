<script setup lang="ts">
import CTAButton from './CTAButton.vue'
</script>

<template>
  <div class="py-6 md:py-0 px-12">
    <div class="md:text-sm prose text-center md:text-left xl:text-xl">
      <p>Create your first real-time app in minutes</p>

<p>
$ npm install -g @feathersjs/cli <br>
$ mkdir my-app <br>
$ cd my-app <br>
$ feathers generate app <br>
$ npm start <br>
</p>

    </div>
    <CTAButton class="mt-6" primary>Learn more</CTAButton>
  </div>
</template>
